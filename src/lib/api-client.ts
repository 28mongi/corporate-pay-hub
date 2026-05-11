// Centralized API client. All requests go through this layer.
// Backend wraps responses in ApiResponse<T>. We unwrap `data` and surface a typed ApiError on non-success.

import type { ApiResponse } from "./types";

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:9090";

export const APP_NAME = (import.meta.env.VITE_APP_NAME as string | undefined) ?? "Corporate Pay Hub";

const TIMEOUT_MS = 30_000;

let runtimeAuthToken: string | null = null;
export function setAuthToken(token: string | null) {
  runtimeAuthToken = token;
}

export class ApiError extends Error {
  status: number;
  code: string;
  requestId?: string;
  details?: unknown;
  constructor(message: string, opts: { status: number; code?: string; requestId?: string; details?: unknown }) {
    super(message);
    this.status = opts.status;
    this.code = opts.code ?? "ERROR";
    this.requestId = opts.requestId;
    this.details = opts.details;
  }
}

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function friendlyError(status: number, fallback: string): string {
  switch (status) {
    case 400: return fallback || "The request was invalid. Please review and try again.";
    case 401:
    case 403: return "You are not authorized to perform this action.";
    case 404: return "The requested resource was not found.";
    case 409: return fallback || "This action conflicts with an existing record.";
    case 408:
    case 504: return "The request timed out. Please try again.";
    case 500:
    case 502:
    case 503: return "The service is currently unavailable. Please try again shortly.";
    default: return fallback || "Unexpected error.";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
  isFormData?: boolean;
  responseType?: "json" | "blob";
  timeoutMs?: number;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(path.startsWith("http") ? path : `${API_BASE_URL}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === "") continue;
      url.searchParams.append(k, String(v));
    }
  }
  return url.toString();
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, signal, isFormData, responseType = "json", timeoutMs = TIMEOUT_MS } = options;

  const requestId = uuid();
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Request-ID": requestId,
    Timestamp: new Date().toISOString(),
  };
  if (runtimeAuthToken) headers.Authorization = `Bearer ${runtimeAuthToken}`;
  if (!isFormData && body !== undefined) headers["Content-Type"] = "application/json";

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  if (signal) signal.addEventListener("abort", () => ac.abort());

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      credentials: "include",
      body: body === undefined ? undefined : isFormData ? (body as BodyInit) : JSON.stringify(body),
      signal: ac.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if ((err as Error).name === "AbortError") {
      throw new ApiError("The request timed out. Please try again.", { status: 408, code: "TIMEOUT", requestId });
    }
    throw new ApiError("Could not reach the server. Check your connection and try again.", {
      status: 0, code: "NETWORK_ERROR", requestId,
    });
  }
  clearTimeout(timer);

  if (responseType === "blob") {
    if (!res.ok) {
      throw new ApiError(friendlyError(res.status, ""), { status: res.status, code: String(res.status), requestId });
    }
    return (await res.blob()) as unknown as T;
  }

  let payload: ApiResponse<T> | { message?: string; code?: string } | null = null;
  const text = await res.text();
  if (text) {
    try { payload = JSON.parse(text); } catch { /* leave null */ }
  }

  if (!res.ok) {
    const msg = (payload as { message?: string })?.message ?? "";
    const code = (payload as { code?: string })?.code ?? String(res.status);
    throw new ApiError(friendlyError(res.status, msg), {
      status: res.status, code, requestId, details: payload,
    });
  }

  if (payload && typeof payload === "object" && "success" in payload) {
    const wrapped = payload as ApiResponse<T>;
    if (!wrapped.success) {
      throw new ApiError(wrapped.message || "Request failed", {
        status: res.status, code: wrapped.code, requestId: wrapped.requestId, details: wrapped.data,
      });
    }
    return wrapped.data;
  }
  return payload as T;
}

export const apiClient = {
  get: <T>(path: string, query?: RequestOptions["query"], signal?: AbortSignal) =>
    apiRequest<T>(path, { method: "GET", query, signal }),
  post: <T>(path: string, body?: unknown, signal?: AbortSignal) =>
    apiRequest<T>(path, { method: "POST", body, signal }),
  postForm: <T>(path: string, form: FormData, signal?: AbortSignal) =>
    apiRequest<T>(path, { method: "POST", body: form, isFormData: true, signal }),
  put: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: "PUT", body }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: "DELETE" }),
};

// Bootstraps the JWT delivered by the parent portal via ?token=<jwt>.
// Token is stored in sessionStorage so it survives in-app navigation
// but is scoped to the current browser tab/session.

import { setAuthToken } from "./api-client";

const STORAGE_KEY = "cph.auth.token";

function readStored(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStored(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) window.sessionStorage.setItem(STORAGE_KEY, token);
    else window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Read ?token=<jwt> from the URL (if present), persist it for the session,
 * then strip it from the address bar so it never leaks into history/logs.
 * Falls back to any previously stored token. Returns true if a token is active.
 */
export function bootstrapAuthToken(): boolean {
  if (typeof window === "undefined") return false;

  const url = new URL(window.location.href);
  const fromQuery = url.searchParams.get("token");

  if (fromQuery) {
    writeStored(fromQuery);
    setAuthToken(fromQuery);
    url.searchParams.delete("token");
    const cleaned = url.pathname + (url.searchParams.toString() ? `?${url.searchParams}` : "") + url.hash;
    window.history.replaceState({}, "", cleaned);
    return true;
  }

  const stored = readStored();
  if (stored) {
    setAuthToken(stored);
    return true;
  }
  return false;
}

export function clearAuthToken() {
  writeStored(null);
  setAuthToken(null);
}

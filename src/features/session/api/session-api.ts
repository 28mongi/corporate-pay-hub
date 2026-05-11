import { apiClient } from "@/lib/api-client";
import type { Session } from "@/lib/types";

export const sessionApi = {
  getCurrentSession: () => apiClient.get<Session>("/api/v1/auth/me"),
};

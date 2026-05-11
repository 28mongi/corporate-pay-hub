import { apiClient } from "@/lib/api-client";
import type { AuditLog, Page } from "@/lib/types";

export interface AuditLogParams {
  page?: number;
  size?: number;
  fromDate?: string;
  toDate?: string;
  action?: string;
  username?: string;
  entityType?: string;
  entityId?: string;
}

export const auditApi = {
  getAuditLogs: (params: AuditLogParams = {}) =>
    apiClient.get<Page<AuditLog>>("/api/v1/audit-logs", params as Record<string, string | number | undefined>),
};

import { apiClient } from "@/lib/api-client";
import type { ApprovalConfig, CreateApprovalConfigPayload } from "@/lib/types";

export const approvalConfigApi = {
  getApprovalConfigs: () => apiClient.get<ApprovalConfig[]>("/api/v1/approval-configs"),
  getApprovalConfigById: (id: string) => apiClient.get<ApprovalConfig>(`/api/v1/approval-configs/${id}`),
  createApprovalConfig: (payload: CreateApprovalConfigPayload) =>
    apiClient.post<ApprovalConfig>("/api/v1/approval-configs", payload),
};

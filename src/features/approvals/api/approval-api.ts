import { apiClient } from "@/lib/api-client";
import type { ApprovalQueueItem } from "@/lib/types";

export const approvalApi = {
  getApprovalQueue: () => apiClient.get<ApprovalQueueItem[]>("/api/v1/approvals/queue"),
  approveBatch: (id: string, comments?: string) =>
    apiClient.post(`/api/v1/payment-batches/${id}/approve`, { comments }),
  rejectBatch: (id: string, comments: string) =>
    apiClient.post(`/api/v1/payment-batches/${id}/reject`, { comments }),
  returnBatchForCorrection: (id: string, comments: string) =>
    apiClient.post(`/api/v1/payment-batches/${id}/return-for-correction`, { comments }),
};

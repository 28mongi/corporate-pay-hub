import { apiClient } from "@/lib/api-client";
import type {
  CreateBatchPayload,
  Page,
  PaymentBatch,
  PaymentItem,
  ProcessingLog,
} from "@/lib/types";

export interface BatchListParams {
  page?: number;
  size?: number;
  status?: string;
  batchNo?: string;
  fromDate?: string;
  toDate?: string;
}

export const batchApi = {
  getBatches: (params: BatchListParams = {}) =>
    apiClient.get<Page<PaymentBatch>>("/api/v1/payment-batches", params as Record<string, string | number | undefined>),
  getBatchById: (id: string) => apiClient.get<PaymentBatch>(`/api/v1/payment-batches/${id}`),
  getBatchItems: (id: string) => apiClient.get<PaymentItem[]>(`/api/v1/payment-batches/${id}/items`),
  createBatch: (payload: CreateBatchPayload) => apiClient.post<PaymentBatch>("/api/v1/payment-batches", payload),
  submitBatchForApproval: (id: string) =>
    apiClient.post<PaymentBatch>(`/api/v1/payment-batches/${id}/submit-for-approval`),
  processBatch: (id: string) => apiClient.post<PaymentBatch>(`/api/v1/payment-batches/${id}/process`),
  getProcessingLogs: (id: string) => apiClient.get<ProcessingLog[]>(`/api/v1/payment-batches/${id}/processing-logs`),
};

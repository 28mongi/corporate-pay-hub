import { apiClient } from "@/lib/api-client";

export interface ReportParams {
  fromDate?: string;
  toDate?: string;
  status?: string;
  transactionType?: string;
  currency?: string;
}

export const reportApi = {
  getPaymentBatchReport: (p: ReportParams = {}) =>
    apiClient.get<unknown>("/api/v1/reports/payment-batches", p as Record<string, string | undefined>),
  getFailedTransactionsReport: (p: ReportParams = {}) =>
    apiClient.get<unknown>("/api/v1/reports/failed-transactions", p as Record<string, string | undefined>),
  getApprovalReport: (p: ReportParams = {}) =>
    apiClient.get<unknown>("/api/v1/reports/approvals", p as Record<string, string | undefined>),
  getUserActivityReport: (p: ReportParams = {}) =>
    apiClient.get<unknown>("/api/v1/reports/user-activity", p as Record<string, string | undefined>),
};

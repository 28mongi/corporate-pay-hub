import { apiClient } from "@/lib/api-client";
import type {
  BatchStatusSummary,
  DashboardSummary,
  PaymentVolumePoint,
  RecentActivityItem,
} from "@/lib/types";

export const dashboardApi = {
  getDashboardSummary: () => apiClient.get<DashboardSummary>("/api/v1/dashboard/summary"),
  getBatchStatusSummary: () => apiClient.get<BatchStatusSummary[]>("/api/v1/dashboard/batch-status-summary"),
  getPaymentVolume: () => apiClient.get<PaymentVolumePoint[]>("/api/v1/dashboard/payment-volume"),
  getRecentActivity: () => apiClient.get<RecentActivityItem[]>("/api/v1/dashboard/recent-activity"),
};

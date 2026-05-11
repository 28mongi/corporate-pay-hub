import { apiClient } from "@/lib/api-client";
import type { FileUploadResult, FileValidationResult } from "@/lib/types";

export const paymentFileApi = {
  validatePaymentFile: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return apiClient.postForm<FileValidationResult>("/api/v1/payment-files/validate", fd);
  },
  uploadPaymentFile: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return apiClient.postForm<FileUploadResult>("/api/v1/payment-files/upload", fd);
  },
};

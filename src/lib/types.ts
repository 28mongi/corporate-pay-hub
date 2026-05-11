// Domain types shared across features. Mirrors backend ApiResponse contract.

export type BatchStatus =
  | "DRAFT"
  | "VALIDATION_FAILED"
  | "PENDING_APPROVAL"
  | "PARTIALLY_APPROVED"
  | "APPROVED"
  | "REJECTED"
  | "RETURNED_FOR_CORRECTION"
  | "SUBMITTED_FOR_PROCESSING"
  | "PROCESSING"
  | "COMPLETED"
  | "PARTIALLY_COMPLETED"
  | "FAILED"
  | "CANCELLED";

export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  timestamp: string;
  requestId: string;
}

export interface PageParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface Session {
  userId: string;
  username: string;
  fullName?: string;
  email?: string;
  companyId?: string;
  companyName?: string;
  billerId?: string;
  institutionId?: string;
  roles?: string[];
  permissions?: string[];
}

export interface PaymentBatch {
  id: string;
  batchNo: string;
  companyId?: string;
  debitAccount?: string;
  currency: string;
  totalRecords: number;
  totalAmount: number;
  status: BatchStatus;
  createdBy?: string;
  createdAt: string;
  submittedAt?: string;
  currentApprovalLevel?: number;
  totalApprovalLevels?: number;
  fileName?: string;
  type?: string;
}

export interface PaymentItem {
  id: string;
  rowNumber?: number;
  reference: string;
  beneficiaryName: string;
  beneficiaryAccount: string;
  bankCode?: string;
  amount: number;
  currency: string;
  narration?: string;
  status?: string;
  failureReason?: string;
}

export interface ProcessingLog {
  id: string;
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR";
  message: string;
  reference?: string;
}

export interface ValidationError {
  rowNumber: number;
  field?: string;
  message: string;
}

export interface FileValidationResult {
  fileId?: string;
  fileName: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  totalAmount: number;
  currency?: string;
  errors: ValidationError[];
}

export interface FileUploadResult {
  fileId: string;
  fileName: string;
  totalRows: number;
  totalAmount: number;
  currency?: string;
}

export interface CreateBatchPayload {
  fileId: string;
  batchNo: string;
  debitAccount: string;
  currency: string;
}

export interface ApprovalQueueItem extends PaymentBatch {
  awaitingLevel?: number;
  awaitingLevelName?: string;
}

export interface ApprovalConfigLevel {
  levelNumber: number;
  levelName: string;
  requiredApprovals: number;
  userIds: string[];
}

export interface ApprovalConfig {
  id: string;
  companyId: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  active?: boolean;
  levels: ApprovalConfigLevel[];
  createdAt?: string;
}

export interface CreateApprovalConfigPayload {
  companyId: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  levels: ApprovalConfigLevel[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  username: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress?: string;
  remarks?: string;
}

export interface DashboardSummary {
  totalBatches?: number;
  pendingApprovals?: number;
  processedAmount?: number;
  failedTransactions?: number;
  currency?: string;
  [k: string]: unknown;
}

export interface BatchStatusSummary {
  status: BatchStatus | string;
  count: number;
}

export interface PaymentVolumePoint {
  date: string;
  processed: number;
  failed: number;
}

export interface RecentActivityItem {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  reference?: string;
}

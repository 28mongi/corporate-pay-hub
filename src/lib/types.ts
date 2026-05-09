export type BatchStatus =
  | "DRAFT"
  | "VALIDATION_FAILED"
  | "PENDING_APPROVAL"
  | "PARTIALLY_APPROVED"
  | "APPROVED"
  | "REJECTED"
  | "SUBMITTED_FOR_PROCESSING"
  | "PROCESSING"
  | "COMPLETED"
  | "PARTIALLY_COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type PaymentType = "INTERNAL" | "RTGS" | "TIPS" | "GEPG";

export type UserRole =
  | "COMPANY_ADMIN"
  | "MAKER"
  | "CHECKER"
  | "APPROVER"
  | "VIEWER"
  | "AUDITOR"
  | "BANK_ADMIN"
  | "BANK_OPERATIONS";

export interface Company {
  id: string;
  name: string;
  code: string;
  country: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  roles: UserRole[];
  companyId: string;
  active: boolean;
  lastLoginAt?: string;
}

export interface PaymentItem {
  id: string;
  reference: string;
  beneficiaryName: string;
  beneficiaryAccount: string;
  bankCode: string;
  amount: number;
  currency: string;
  type: PaymentType;
  narration: string;
  status?: "PENDING" | "PROCESSED" | "FAILED";
  failureReason?: string;
}

export interface ApprovalStep {
  level: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SKIPPED";
  approverName?: string;
  approverId?: string;
  comments?: string;
  actedAt?: string;
}

export interface PaymentBatch {
  id: string;
  reference: string;
  companyId: string;
  companyName: string;
  fileName: string;
  totalRecords: number;
  totalAmount: number;
  currency: string;
  status: BatchStatus;
  type: PaymentType;
  createdBy: string;
  createdAt: string;
  currentApprovalLevel: number;
  approvalSteps: ApprovalStep[];
  items: PaymentItem[];
  processedCount?: number;
  failedCount?: number;
}

export interface ApprovalLevel {
  level: number;
  name: string;
  approverIds: string[];
  requiredApprovals: number;
  minAmount?: number;
  maxAmount?: number;
}

export interface ApprovalMatrix {
  id: string;
  name: string;
  companyId: string;
  active: boolean;
  paymentType?: PaymentType;
  levels: ApprovalLevel[];
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entity: string;
  entityId: string;
  ipAddress: string;
  remarks?: string;
}

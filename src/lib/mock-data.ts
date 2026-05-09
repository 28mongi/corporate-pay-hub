import type {
  ApprovalMatrix,
  AuditLog,
  Company,
  PaymentBatch,
  PaymentItem,
  User,
} from "./types";

export const company: Company = {
  id: "co_001",
  name: "Meridian Holdings Ltd",
  code: "MERIDIAN",
  country: "Tanzania",
};

export const users: User[] = [
  { id: "u1", fullName: "Aisha Mwangi", email: "aisha@meridian.co", roles: ["COMPANY_ADMIN", "APPROVER"], companyId: "co_001", active: true, lastLoginAt: "2025-05-08T09:12:00Z" },
  { id: "u2", fullName: "David Otieno", email: "david@meridian.co", roles: ["MAKER"], companyId: "co_001", active: true, lastLoginAt: "2025-05-09T07:40:00Z" },
  { id: "u3", fullName: "Grace Kimani", email: "grace@meridian.co", roles: ["CHECKER"], companyId: "co_001", active: true, lastLoginAt: "2025-05-09T08:01:00Z" },
  { id: "u4", fullName: "Samuel Njoroge", email: "samuel@meridian.co", roles: ["APPROVER"], companyId: "co_001", active: true, lastLoginAt: "2025-05-08T16:22:00Z" },
  { id: "u5", fullName: "Linet Achieng", email: "linet@meridian.co", roles: ["VIEWER", "AUDITOR"], companyId: "co_001", active: false },
  { id: "u6", fullName: "Bank Operator", email: "ops@bank.co", roles: ["BANK_OPERATIONS"], companyId: "co_001", active: true },
];

const sampleItems = (n: number, prefix: string): PaymentItem[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `${prefix}-i${i + 1}`,
    reference: `${prefix}REF${String(i + 1).padStart(5, "0")}`,
    beneficiaryName: ["Jane Doe", "ACME Supplies", "Kibo Foods Ltd", "John Smith", "Zawadi Traders"][i % 5],
    beneficiaryAccount: `01${Math.floor(1000000000 + Math.random() * 8999999999)}`,
    bankCode: ["CRDB", "NMB", "NBC", "STAN", "EQTY"][i % 5],
    amount: Math.round((500 + Math.random() * 50000) * 100) / 100,
    currency: "TZS",
    type: (["INTERNAL", "RTGS", "TIPS", "GEPG"] as const)[i % 4],
    narration: "Vendor payment",
    status: i % 9 === 0 ? "FAILED" : "PENDING",
    failureReason: i % 9 === 0 ? "Invalid account" : undefined,
  }));

export const batches: PaymentBatch[] = [
  {
    id: "b_1001", reference: "BTH-2025-001001", companyId: "co_001", companyName: company.name,
    fileName: "payroll_may_w2.csv", totalRecords: 124, totalAmount: 18_540_000, currency: "TZS",
    status: "PENDING_APPROVAL", type: "INTERNAL", createdBy: "David Otieno",
    createdAt: "2025-05-09T06:30:00Z", currentApprovalLevel: 1,
    approvalSteps: [
      { level: 1, status: "PENDING" },
      { level: 2, status: "PENDING" },
    ],
    items: sampleItems(8, "P1"),
  },
  {
    id: "b_1002", reference: "BTH-2025-001002", companyId: "co_001", companyName: company.name,
    fileName: "vendors_q2.xlsx", totalRecords: 36, totalAmount: 4_220_500, currency: "TZS",
    status: "PARTIALLY_APPROVED", type: "RTGS", createdBy: "David Otieno",
    createdAt: "2025-05-09T05:10:00Z", currentApprovalLevel: 2,
    approvalSteps: [
      { level: 1, status: "APPROVED", approverName: "Grace Kimani", actedAt: "2025-05-09T05:55:00Z", comments: "Verified" },
      { level: 2, status: "PENDING" },
    ],
    items: sampleItems(6, "P2"),
  },
  {
    id: "b_1003", reference: "BTH-2025-001003", companyId: "co_001", companyName: company.name,
    fileName: "tax_gepg_apr.csv", totalRecords: 12, totalAmount: 980_000, currency: "TZS",
    status: "COMPLETED", type: "GEPG", createdBy: "David Otieno",
    createdAt: "2025-05-07T11:20:00Z", currentApprovalLevel: 2,
    approvalSteps: [
      { level: 1, status: "APPROVED", approverName: "Grace Kimani", actedAt: "2025-05-07T12:10:00Z" },
      { level: 2, status: "APPROVED", approverName: "Aisha Mwangi", actedAt: "2025-05-07T13:01:00Z" },
    ],
    items: sampleItems(5, "P3"),
    processedCount: 12, failedCount: 0,
  },
  {
    id: "b_1004", reference: "BTH-2025-001004", companyId: "co_001", companyName: company.name,
    fileName: "supplier_tips.csv", totalRecords: 58, totalAmount: 7_120_000, currency: "TZS",
    status: "PARTIALLY_COMPLETED", type: "TIPS", createdBy: "David Otieno",
    createdAt: "2025-05-06T09:00:00Z", currentApprovalLevel: 2,
    approvalSteps: [
      { level: 1, status: "APPROVED", approverName: "Grace Kimani", actedAt: "2025-05-06T09:30:00Z" },
      { level: 2, status: "APPROVED", approverName: "Samuel Njoroge", actedAt: "2025-05-06T10:00:00Z" },
    ],
    items: sampleItems(7, "P4"),
    processedCount: 54, failedCount: 4,
  },
  {
    id: "b_1005", reference: "BTH-2025-001005", companyId: "co_001", companyName: company.name,
    fileName: "rejected_test.csv", totalRecords: 9, totalAmount: 230_000, currency: "TZS",
    status: "REJECTED", type: "INTERNAL", createdBy: "David Otieno",
    createdAt: "2025-05-05T14:00:00Z", currentApprovalLevel: 1,
    approvalSteps: [
      { level: 1, status: "REJECTED", approverName: "Grace Kimani", actedAt: "2025-05-05T15:00:00Z", comments: "Duplicate references" },
    ],
    items: sampleItems(4, "P5"),
  },
  {
    id: "b_1006", reference: "BTH-2025-001006", companyId: "co_001", companyName: company.name,
    fileName: "draft_upload.csv", totalRecords: 22, totalAmount: 1_540_000, currency: "TZS",
    status: "DRAFT", type: "INTERNAL", createdBy: "David Otieno",
    createdAt: "2025-05-09T07:55:00Z", currentApprovalLevel: 0,
    approvalSteps: [],
    items: sampleItems(5, "P6"),
  },
];

export const matrices: ApprovalMatrix[] = [
  {
    id: "m1", name: "Standard Payments", companyId: "co_001", active: true,
    createdAt: "2025-01-12T10:00:00Z",
    levels: [
      { level: 1, name: "Checker", approverIds: ["u3"], requiredApprovals: 1, maxAmount: 5_000_000 },
      { level: 2, name: "Approver", approverIds: ["u4", "u1"], requiredApprovals: 1, minAmount: 5_000_001 },
    ],
  },
  {
    id: "m2", name: "High-Value RTGS", companyId: "co_001", active: true, paymentType: "RTGS",
    createdAt: "2025-02-02T10:00:00Z",
    levels: [
      { level: 1, name: "Checker", approverIds: ["u3"], requiredApprovals: 1 },
      { level: 2, name: "Senior Approver", approverIds: ["u4"], requiredApprovals: 1 },
      { level: 3, name: "Admin", approverIds: ["u1"], requiredApprovals: 1, minAmount: 20_000_000 },
    ],
  },
];

export const auditLogs: AuditLog[] = [
  { id: "a1", timestamp: "2025-05-09T08:35:00Z", user: "David Otieno", action: "BATCH_UPLOADED", entity: "Batch", entityId: "BTH-2025-001001", ipAddress: "10.10.4.21", remarks: "124 records" },
  { id: "a2", timestamp: "2025-05-09T08:36:00Z", user: "David Otieno", action: "BATCH_SUBMITTED", entity: "Batch", entityId: "BTH-2025-001001", ipAddress: "10.10.4.21" },
  { id: "a3", timestamp: "2025-05-09T05:55:00Z", user: "Grace Kimani", action: "BATCH_APPROVED_L1", entity: "Batch", entityId: "BTH-2025-001002", ipAddress: "10.10.4.18", remarks: "Verified" },
  { id: "a4", timestamp: "2025-05-08T17:12:00Z", user: "Aisha Mwangi", action: "USER_DEACTIVATED", entity: "User", entityId: "u5", ipAddress: "10.10.4.10" },
  { id: "a5", timestamp: "2025-05-07T13:02:00Z", user: "Aisha Mwangi", action: "BATCH_APPROVED_L2", entity: "Batch", entityId: "BTH-2025-001003", ipAddress: "10.10.4.10" },
  { id: "a6", timestamp: "2025-05-07T13:30:00Z", user: "System", action: "BATCH_PROCESSED", entity: "Batch", entityId: "BTH-2025-001003", ipAddress: "—", remarks: "12/12 successful" },
];

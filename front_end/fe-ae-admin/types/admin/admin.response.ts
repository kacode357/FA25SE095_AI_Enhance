// types/admin/admin.response.ts

/** ==== USER MODELS ==== */
export interface AdminUserItemResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  subscriptionTier: string;
  isEmailConfirmed: boolean;
  lastLoginAt: string;
  crawlQuotaUsed: number;
  crawlQuotaLimit: number;
  institutionName: string;
  createdAt: string;
}

/** ==== LIST RESPONSE ==== */
export interface PendingApprovalResponse {
  users: AdminUserItemResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminGetUsersResponse {
  users: AdminUserItemResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** ==== DETAIL RESPONSE ==== */
export interface AdminUserDetailResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  subscriptionTier: string;
  isEmailConfirmed: boolean;
  emailConfirmedAt: string;
  lastLoginAt: string;
  crawlQuotaUsed: number;
  crawlQuotaLimit: number;
  quotaResetDate: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  institutionName: string;
  institutionAddress: string;
  studentId: string;
  department: string;
  createdAt: string;
  updatedAt: string;
}

/** ==== ACTION RESPONSES ==== */
export interface ApproveUserResponse {
  success: boolean;
  message: string;
  userId: string;
  userEmail: string;
  status: string;
}

export interface SuspendUserResponse {
  success: boolean;
  message: string;
  userId: string;
  userEmail: string;
  status: string;
}

export interface ReactivateUserResponse {
  success: boolean;
  message: string;
  userId: string;
  userEmail: string;
  status: string;
}
// types/admin/admin-user.response.ts

export type AdminUserRole =
  | "Student"
  | "Lecturer"
  | "Staff"
  | "Admin"
  | "PaidUser";

export type AdminUserStatus =
  | "Pending"
  | "Active"
  | "Inactive"
  | "Suspended"
  | "Deleted"
  | "PendingApproval";

export type AdminSubscriptionTier =
  | "Free"
  | "Basic"
  | "Premium"
  | "Enterprise";

export interface AdminUserItem {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: AdminUserRole;
  status: AdminUserStatus;
  subscriptionTier: AdminSubscriptionTier;
  isEmailConfirmed: boolean;
  lastLoginAt: string | null;
  crawlQuotaUsed: number;
  crawlQuotaLimit: number;
  institutionName: string | null;
  studentId: string | null;
  profilePictureUrl: string | null;
  createdAt: string;
}

export interface AdminUserDetail extends AdminUserItem {
  fullName: string | null;
  emailConfirmedAt: string | null;
  quotaResetDate: string | null;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  institutionAddress: string | null;
  department: string | null;
  updatedAt: string;
}

export interface PaginatedAdminUsers {
  users: AdminUserItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

type ResponseEnvelope<T> = {
  status: number;
  message: string;
  data: T;
};

type ActionResponse<T = void> = {
  status: number;
  message: string;
  data?: T;
};

export type GetAdminUsersResponse = ResponseEnvelope<PaginatedAdminUsers>;
export type GetAdminUserByIdResponse = ResponseEnvelope<AdminUserDetail>;
export type GetPendingApprovalUsersResponse =
  ResponseEnvelope<PaginatedAdminUsers>;

export type AdminUserActionResponse = ActionResponse;
export type ApproveAdminUserResponse = AdminUserActionResponse;
export type SuspendAdminUserResponse = AdminUserActionResponse;
export type ReactivateAdminUserResponse = AdminUserActionResponse;
export type UpdateAdminUserQuotaResponse = AdminUserActionResponse;
export type ResetAdminUserQuotaResponse = AdminUserActionResponse;

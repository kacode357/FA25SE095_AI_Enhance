// types/admin/admin-user.payload.ts

export enum AdminUserRoleFilter {
  Student = 0,
  Lecturer = 1,
  Staff = 2,
  Admin = 3,
  PaidUser = 4,
}

export enum AdminUserStatusFilter {
  Pending = 0,
  Active = 1,
  Inactive = 2,
  Suspended = 3,
  Deleted = 4,
  PendingApproval = 5,
}

export enum AdminSubscriptionTierFilter {
  Free = 0,
  Basic = 1,
  Premium = 2,
  Enterprise = 3,
}

export type AdminUsersSortBy =
  | "CreatedAt"
  | "LastLoginAt"
  | "Email"
  | "Role"
  | "Status"
  | "SubscriptionTier";

export type AdminUsersSortOrder = "Asc" | "Desc";

interface PaginationQuery {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
}

interface AdminUserFilters {
  role?: AdminUserRoleFilter;
  status?: AdminUserStatusFilter;
  subscriptionTier?: AdminSubscriptionTierFilter;
  emails?: string[];
}

interface SortableQuery {
  sortBy?: AdminUsersSortBy | string;
  sortOrder?: AdminUsersSortOrder | string;
}

export type AdminUsersQuery = PaginationQuery & AdminUserFilters & SortableQuery;

export interface SuspendAdminUserPayload {
  reason: string;
  suspendUntil?: string | null;
}

export interface UpdateAdminUserQuotaPayload {
  quotaLimit: number;
}

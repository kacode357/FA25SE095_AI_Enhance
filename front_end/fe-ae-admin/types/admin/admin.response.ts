// types/admin/admin.response.ts

/** ==== USER MODELS ==== */

export enum UserStatus {
    Pending = 0,        // Account created but not verified
    Active = 1,         // Fully active account
    Inactive = 2,       // Temporarily disabled
    Suspended = 3,      // Suspended due to policy violation
    Deleted = 4,        // Soft deleted
    PendingApproval = 5 // Waiting for staff approval (lecturers)
}
export interface AdminUserItemResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;                // "Student" | "Staff" | "Admin"...
  status: UserStatus;              // "Active" | "Pending"...
  subscriptionTier: string;    // "Free" | "Basic" | "Premium" | "Enterprise"
  isEmailConfirmed: boolean;

  lastLoginAt: string | null;  // null hoặc ISO string

  crawlQuotaUsed: number;
  crawlQuotaLimit: number;

  institutionName: string | null;
  studentId: string | null;

  profilePictureUrl: string | null;

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
// Cập nhật theo GET /api/Admin/users/{userId}
export interface AdminUserDetailResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;                // ✅ mới
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
  profilePictureUrl: string;       // ✅ mới
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

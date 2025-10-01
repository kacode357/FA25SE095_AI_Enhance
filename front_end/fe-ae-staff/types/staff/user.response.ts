export interface StaffUserSummary {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  lastLoginAt?: string;
}

export interface StaffGetUsersResponse {
  page: number;
  pageSize: number;
  total: number;
  users: StaffUserSummary[];
}

export interface StaffUserDetailResponse extends StaffUserSummary {
  createdAt: string;
  updatedAt: string;
  institution?: string;
}

export interface ReactivateUserResponse { success: boolean; message?: string; }
export interface PendingApprovalResponse { total: number; users: StaffUserSummary[]; }

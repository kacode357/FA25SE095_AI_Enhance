// types/admin/admin.payload.ts

/** ==== PARAMS & PAYLOADS ==== */
export interface PendingApprovalParams {
  page?: number;
  pageSize?: number;
}

export interface SuspendUserPayload {
  reason: string;
  suspendUntil: string;
}

export interface GetUsersParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  role?: number;
  status?: number;
  subscriptionTier?: string;
  sortBy?: string;
  sortOrder?: string;
}

/** GET /api/Admin/users/{userId} — path params */
export interface GetUserDetailParams {
  userId: string;
}

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

export enum SubscriptionTier {
  Free = 0,
  Basic = 1,
  Premium = 2,
  Enterprise = 3,
}

export interface GetUsersParams {
  page?: number;               // Page (int)
  pageSize?: number;           // PageSize (int)
  searchTerm?: string;         // SearchTerm (string)
  role?: number;               // Role (int)
  status?: number;             // Status (int)
  subscriptionTier?: SubscriptionTier;   // SubscriptionTier (int - enum)
  sortBy?: string;             // SortBy (string)
  sortOrder?: string;          // SortOrder (string)
  emails?: string[];           // Emails[] (array of string)
}

/** GET /api/Admin/users/{userId} — path params */
export interface GetUserDetailParams {
  userId: string;
}

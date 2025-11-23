// types/support/support-request.response.ts

/** Status enum cho support request */
export enum SupportRequestStatus {
  Pending = 0,
  InProgress = 1,
  Resolved = 2,
  Cancelled = 3,
  Rejected = 4,
}

/** Priority enum (mirror BE) */
export enum SupportRequestPriority {  
  Low = 0,
    Medium = 1,
    High = 2,
    Urgent = 3
}

/** Category enum (mirror BE) */
export enum SupportRequestCategory {
  Technical = 0,
  Academic = 1,
  Administrative = 2,
  Other = 3,
}

/** Item support request trả về từ API */
export interface SupportRequestItem {
  id: string;
  courseId: string;
  courseName: string;

  requesterId: string;
  requesterName: string;
  /** Ví dụ: "Student", "Lecturer" */
  requesterRole: string;

  /** Staff được assign (nếu có) */
  assignedStaffId: string | null;
  assignedStaffName: string | null;

  /** Status enum (BE dùng số, ví dụ 0 = Pending, ...) */
  status: SupportRequestStatus;
  /** Priority enum (BE dùng số) */
  priority: SupportRequestPriority;
  /** Category enum (BE dùng số) */
  category: SupportRequestCategory;

  subject: string;
  /**
   * Mô tả – trong một số API (pending) có thể không trả về nên để optional
   * /my, /assigned: có description
   * /pending: swagger ví dụ không có description
   */
  description?: string;

  /** Id conversation trong hệ thống chat (nếu đã tạo) */
  conversationId?: string | null;

  /** Thời gian tạo / yêu cầu */
  requestedAt: string;
  /** Thời gian staff accept (có thể null hoặc không có) */
  acceptedAt?: string | null;
  /** Thời gian resolved (có thể null hoặc không có) */
  resolvedAt?: string | null;
}

/** Wrapper phân trang chung cho list support requests */
export interface PaginatedSupportRequests {
  data: SupportRequestItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/** POST /api/SupportRequests */
export interface CreateSupportRequestResponse {
  success: boolean;
  message: string;
  supportRequestId: string;
}

/** GET /api/SupportRequests/my */
export interface GetMySupportRequestsResponse {
  success: boolean;
  message: string;
  data: PaginatedSupportRequests;
}

/** GET /api/SupportRequests/pending */
export interface GetPendingSupportRequestsResponse {
  success: boolean;
  message: string;
  data: PaginatedSupportRequests;
}

/** GET /api/SupportRequests/assigned */
export interface GetAssignedSupportRequestsResponse {
  success: boolean;
  message: string;
  data: PaginatedSupportRequests;
}

/** POST /api/SupportRequests/{id}/accept */
export interface AcceptSupportRequestResponse {
  success: boolean;
  message: string;
  conversationId: string;
}

/** PATCH /api/SupportRequests/{id} (cancel) */
export interface CancelSupportRequestResponse {
  success: boolean;
  message: string;
}

/** POST /api/SupportRequests/{id}/reject */
export interface RejectSupportRequestResponse {
  success: boolean;
  message: string;
}

/** POST /api/SupportRequests/{id}/resolve */
export interface ResolveSupportRequestResponse {
  success: boolean;
  message: string;
}

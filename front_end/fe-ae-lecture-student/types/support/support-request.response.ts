// types/support/support-request.response.ts

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
  status: number;
  /** Priority enum (BE dùng số) */
  priority: number;
  /** Category enum (BE dùng số) */
  category: number;

  subject: string;
  /** Có thể không có trong một số API (pending) nên để optional */
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

/** POST /api/SupportRequests/{id}/resolve */
export interface ResolveSupportRequestResponse {
  success: boolean;
  message: string;
}

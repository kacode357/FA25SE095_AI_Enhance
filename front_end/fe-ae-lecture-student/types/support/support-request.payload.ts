// types/support/support-request.payload.ts

/** Payload tạo mới support request: POST /api/SupportRequests */
import { SupportRequestCategory, SupportRequestPriority } from "./support-request.response";

export interface CreateSupportRequestPayload {
  /** Id khoá học liên quan */
  courseId: string;
  /** Độ ưu tiên (enum bên BE) */
  priority: SupportRequestPriority;
  /** Loại request (enum bên BE) */
  category: SupportRequestCategory;
  /** Tiêu đề ngắn gọn */
  subject: string;
  /** Mô tả chi tiết vấn đề */
  description: string;
}

/** Query GET /api/SupportRequests/my */
export interface GetMySupportRequestsQuery {
  /** Lọc theo courseId (optional) */
  courseId?: string;
  /** Lọc theo status (string – ví dụ "Pending", "InProgress", "Resolved", "Cancelled", "Rejected") */
  status?: string;
  /** Trang hiện tại (default 1) */
  pageNumber?: number;
  /** Số phần tử mỗi trang (default 20) */
  pageSize?: number;
}

/** Query GET /api/SupportRequests/pending (Staff only) */
export interface GetPendingSupportRequestsQuery {
  /** Lọc theo courseId (optional) */
  courseId?: string;
  /** Trang hiện tại (default 1) */
  pageNumber?: number;
  /** Số phần tử mỗi trang (default 20) */
  pageSize?: number;
}

/** Query GET /api/SupportRequests/assigned (Staff only) */
export interface GetAssignedSupportRequestsQuery {
  /** Lọc theo status (string – tuỳ BE định nghĩa, ví dụ "InProgress", "Resolved", ...) */
  status?: string;
  /** Trang hiện tại (default 1) */
  pageNumber?: number;
  /** Số phần tử mỗi trang (default 20) */
  pageSize?: number;
}

/** Payload reject support request: POST /api/SupportRequests/{id}/reject */
export interface RejectSupportRequestPayload {
  /** Id request – BE vẫn yêu cầu trong body dù đã có trên route */
  supportRequestId: string;
  /** Lý do reject – map với SupportRequestRejectionReason enum bên BE */
  rejectionReason: number;
  /** Ghi chú thêm (optional) */
  rejectionComments?: string;
}

// types/support/support-request.payload.ts

/** Payload tạo mới support request: POST /api/SupportRequests */
export interface CreateSupportRequestPayload {
  /** Id khoá học liên quan */
  courseId: string;
  /** Độ ưu tiên (enum bên BE – dùng number cho chắc) */
  priority: number;
  /** Loại request (enum bên BE – dùng number cho chắc) */
  category: number;
  /** Tiêu đề ngắn gọn */
  subject: string;
  /** Mô tả chi tiết vấn đề */
  description: string;
}

/** Query GET /api/SupportRequests/my */
export interface GetMySupportRequestsQuery {
  /** Lọc theo courseId (optional) */
  courseId?: string;
  /** Lọc theo status (string – tuỳ BE định nghĩa: "Pending", "Resolved", ...) */
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
  /** Lọc theo status (string – tuỳ BE định nghĩa) */
  status?: string;
  /** Trang hiện tại (default 1) */
  pageNumber?: number;
  /** Số phần tử mỗi trang (default 20) */
  pageSize?: number;
}

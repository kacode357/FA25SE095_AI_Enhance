// types/support/support-request.response.ts

export enum SupportRequestStatus {
  Pending = 0,
  InProgress = 1,
  Resolved = 2,
  Cancelled = 3,
  Rejected = 4,
}

export enum SupportRequestPriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Urgent = 3,
}

export enum SupportRequestCategory {
  Technical = 0,
  Academic = 1,
  Administrative = 2,
  Other = 3,
}

export interface SupportRequestItem {
  id: string;
  courseId: string;
  courseName: string;
  requesterId: string;
  requesterName: string;
  requesterRole: string;
  assignedStaffId: string | null;
  assignedStaffName: string | null;
  status: SupportRequestStatus;
  priority: SupportRequestPriority;
  category: SupportRequestCategory;
  subject: string;
  description?: string;
  images?: string | null;
  conversationId?: string | null;
  requestedAt: string;
  acceptedAt?: string | null;
  resolvedAt?: string | null;
}

export interface PaginatedSupportRequests {
  data: SupportRequestItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CreateSupportRequestResponse {
  success: boolean;
  message: string;
  supportRequestId: string;
}

export interface GetMySupportRequestsResponse {
  success: boolean;
  message: string;
  data: PaginatedSupportRequests;
}

export interface GetPendingSupportRequestsResponse {
  success: boolean;
  message: string;
  data: PaginatedSupportRequests;
}

export interface GetAssignedSupportRequestsResponse {
  success: boolean;
  message: string;
  data: PaginatedSupportRequests;
}

export interface AcceptSupportRequestResponse {
  success: boolean;
  message: string;
  conversationId: string;
}

export interface CancelSupportRequestResponse {
  success: boolean;
  message: string;
}

export interface RejectSupportRequestResponse {
  success: boolean;
  message: string;
}

export interface ResolveSupportRequestResponse {
  success: boolean;
  message: string;
}

export interface UploadSupportRequestImagesResponse {
  success: boolean;
  message: string;
  uploadedImageUrls: string[];
  uploadedCount: number;
}

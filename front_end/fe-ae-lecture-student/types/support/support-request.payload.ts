import { SupportRequestCategory, SupportRequestPriority } from "./support-request.response";

export interface CreateSupportRequestPayload {
  courseId: string;
  priority: SupportRequestPriority;
  category: SupportRequestCategory;
  subject: string;
  description: string;
}

export interface GetMySupportRequestsQuery {
  courseId?: string;
  status?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface GetPendingSupportRequestsQuery {
  courseId?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface GetAssignedSupportRequestsQuery {
  status?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface RejectSupportRequestPayload {
  supportRequestId: string;
  rejectionReason: number;
  rejectionComments?: string;
}


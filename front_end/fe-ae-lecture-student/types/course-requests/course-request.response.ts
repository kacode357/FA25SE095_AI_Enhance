export enum CourseRequestStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
  Cancelled = 4,
}

export interface CourseRequestResponse {
  success: boolean;
  message: string;
  courseRequestId: string;
  courseRequest: CreateCourseRequestResponse;
}

export interface CreateCourseRequestResponse {
  id: string;
  courseCodeId: string;
  courseCode: string;
  courseCodeTitle: string;
  description: string;
  term: string;
  year?: number;
  lecturerId: string;
  lecturerName: string;
  status: number;
  requestReason: string;
  processedBy: string;
  processedByName: string;
  processedAt: string;
  processingComments: string;
  createdCourseId: string;
  announcement: string;
  syllabusFile: string;
  createdAt: string;
  department: string;
}

export interface GetMyCourseRequestsResponse {
  success: boolean;
  message: string;
  courseRequests: CreateCourseRequestResponse[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GetCourseRequestByIdResponse {
  success: boolean;
  message: string;
  courseRequest: CreateCourseRequestResponse;
}

export interface UploadSyllabusResponse {
  success: boolean;
  message: string;
  fileUrl?: string;
}

export interface DeleteSyllabusResponse {
  success: boolean;
  message: string;
}

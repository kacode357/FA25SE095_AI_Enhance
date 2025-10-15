export interface CourseRequest {
  id: string;
  courseCodeId: string;
  courseCode: string;
  courseCodeTitle: string;
  description: string;
  term: string;
  year: number;
  lecturerId: string;
  lecturerName: string;
  status: number;
  requestReason: string | null;
  processedBy: string | null;
  processedByName: string | null;
  processedAt: string | null;
  processingComments: string | null;
  createdCourseId: string | null;
  createdAt: string;
  department: string;
}

export interface GetCourseRequestsResponse {
  success: boolean;
  message: string;
  courseRequests: CourseRequest[];
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
  courseRequest: CourseRequest;
}

export interface ProcessCourseRequestResponse {
  success: boolean;
  message: string;
  courseRequest: CourseRequest;
  createdCourse?: {
    id: string;
    courseCode: string;
    courseCodeTitle: string;
    name: string;
    description: string;
    term: string;
    year: number;
    lecturerId: string;
    lecturerName: string;
    createdAt: string;
    enrollmentCount: number;
    status: number;
    approvedBy: string;
    approvedByName: string;
    approvedAt: string;
    approvalComments: string;
    rejectionReason: string;
    canEnroll: boolean;
    requiresAccessCode: boolean;
    accessCode: string;
    accessCodeCreatedAt: string;
    accessCodeExpiresAt: string;
    isAccessCodeExpired: boolean;
    department: string;
  };
}

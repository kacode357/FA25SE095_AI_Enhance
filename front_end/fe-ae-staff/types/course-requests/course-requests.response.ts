// types/course-requests/course-requests.response.ts

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
  requestReason: string;
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

// ✅ Thêm cho API GET /CourseRequests/{id}
export interface GetCourseRequestByIdResponse extends CourseRequest {}

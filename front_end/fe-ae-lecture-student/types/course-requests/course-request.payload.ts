export interface CourseRequestPayload {
  courseCodeId: string;
  description: string;
  termId: string;
  year: number;
  requestReason?: string;
  studentEnrollmentFile?: File | null;
  lecturerId?: string;
}

export interface GetMyCourseRequestsQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  name?: string;
  courseCode?: string;
  lecturerName?: string;
  createdAfter?: string;
  createdBefore?: string;
  status?: number | string;
}

export interface CourseRequestPayload {
  courseCodeId: string;
  description: string;
  term: string;
  year: number;
  requestReason?: string;
  studentEnrollmentFile?: File | null;
  lecturerId?: string;
}

export interface GetMyCourseRequestsQuery {
  page?: number; // default 1
  pageSize?: number; // default 10
  sortBy?: string; // e.g., "CreatedAt"
  sortDirection?: "asc" | "desc";
  // Filters
  name?: string;
  courseCode?: string;
  lecturerName?: string;
  createdAfter?: string; // ISO yyyy-MM-dd
  createdBefore?: string; // ISO yyyy-MM-dd
  status?: number | string;
}

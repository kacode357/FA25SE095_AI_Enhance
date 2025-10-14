// types/course-requests/course-requests.payload.ts

export interface GetCourseRequestsQuery {
  status?: 1 | 2 | 3 | 4;
  lecturerName?: string;
  courseCode?: string;
  term?: string;
  year?: number;
  department?: string;
  createdAfter?: string; // ISO date
  createdBefore?: string; // ISO date
  sortBy?: "CreatedAt" | "LecturerName" | "CourseCode" | "Term" | "Year" | "Department";
  sortDirection?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface ProcessCourseRequestPayload {
  status: 2 | 3; // 2 = Approved, 3 = Rejected
  processingComments?: string;
}

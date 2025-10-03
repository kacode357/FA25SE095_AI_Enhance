// types/courses/course.payload.ts

/** Query params lấy danh sách khoá học public */
export interface GetAvailableCoursesQuery {
  name?: string;
  courseCode?: string;
  lecturerName?: string;
  createdAfter?: string;     // ISO date
  createdBefore?: string;    // ISO date
  minEnrollmentCount?: number;
  maxEnrollmentCount?: number;
  page?: number;             // default 1
  pageSize?: number;         // default 10
  sortBy?: "Name" | "CourseCode" | "CreatedAt" | "EnrollmentCount";
  sortDirection?: "asc" | "desc";
}

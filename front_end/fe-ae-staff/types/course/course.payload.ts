// types/course/course.payload.ts

/** ✅ Query cho GET /api/Courses/all */
export interface GetAllCoursesQuery {
  name?: string;
  courseCode?: string;
  lecturerName?: string;
  status?: 1 | 2 | 3 | 4; // 1=Pending, 2=Active, 3=Rejected, 4=Cancelled
  createdAfter?: string; // ISO date
  createdBefore?: string; // ISO date
  minEnrollmentCount?: number;
  maxEnrollmentCount?: number;
  page?: number;
  pageSize?: number;
  sortBy?: "Name" | "CourseCode" | "CreatedAt" | "EnrollmentCount";
  sortDirection?: "asc" | "desc";
}

/** ✅ Body cho PUT /api/Courses/{id}/approve */
export interface ApproveCoursePayload {
  comments?: string;
}

/** ✅ Body cho PUT /api/Courses/{id}/reject */
export interface RejectCoursePayload {
  rejectionReason?: string;
}

/** ✅ Query cho GET /api/Courses/{id}/enrollments */
export interface GetCourseEnrollmentsQuery {
  page?: number;
  pageSize?: number;
  studentName?: string;
  sortDirection?: "asc" | "desc";
}
export interface GetCourseEnrollmentsQuery {
  page?: number;              // default server: 1
  pageSize?: number;          // default server: 10
  studentName?: string;       // partial match
  sortDirection?: "asc" | "desc"; // default server: desc
}
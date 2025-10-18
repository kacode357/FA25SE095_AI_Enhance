// types/courses/course.payload.ts

export interface CreateCoursePayload {
  courseCodeId: string;
  description: string;
  termId: string;
  year: number;
  requiresAccessCode: boolean;
  accessCodeType?: number;
  customAccessCode?: string;
  accessCodeExpiresAt?: string; // ISO datetime
}
export interface UpdateCoursePayload {
  courseId: string;
  courseCodeId: string;
  description: string;
  termId: string;
  year: number;
}

/** Query params lấy courses của current user */
export interface GetMyCoursesQuery {
  asLecturer: boolean;          // true = giảng viên, false = student
  name?: string;
  courseCode?: string;
  lecturerName?: string;
  createdAfter?: string;
  createdBefore?: string;
  minEnrollmentCount?: number;
  maxEnrollmentCount?: number;
  page?: number;                // default 1
  pageSize?: number;            // default 10
  sortBy?: "Name" | "CourseCode" | "CreatedAt" | "EnrollmentCount";
  sortDirection?: "asc" | "desc";
}

export interface UpdateAccessCodeRequest {
  requiresAccessCode: boolean;
  accessCodeType?: number;
  customAccessCode?: string;
  expiresAt?: string;
  regenerateCode?: boolean;
}

/** ✅ Query cho GET /api/Courses/{id}/enrollments */
export interface GetCourseEnrollmentsQuery {
  page?: number;
  pageSize?: number;
  studentName?: string;
  sortDirection?: "asc" | "desc";
}

/** ✅ Query cho GET /api/Courses/available (Student) */
export interface GetAvailableCoursesQuery {
  name?: string;
  courseCode?: string;
  lecturerName?: string;
  createdAfter?: string;
  createdBefore?: string;
  minEnrollmentCount?: number;
  maxEnrollmentCount?: number;
  page?: number;
  pageSize?: number;
  sortBy?: "Name" | "CourseCode" | "CreatedAt" | "EnrollmentCount";
  sortDirection?: "asc" | "desc";
}

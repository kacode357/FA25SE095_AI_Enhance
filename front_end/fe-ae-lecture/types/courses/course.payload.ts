// types/courses/course.payload.ts

/** Payload tạo course */
export interface CreateCoursePayload {
  courseCode: string;
  name: string;
  requiresAccessCode: boolean;
  accessCodeType?: number;
  customAccessCode?: string;
  accessCodeExpiresAt?: string; // ISO datetime
}

/** Payload update course */
export interface UpdateCoursePayload {
  courseId: string;
  courseCode: string;
  courseName: string;
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

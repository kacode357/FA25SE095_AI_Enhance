// types/enrollments/enrollments.response.ts

/**
 * ✅ Generic API response for successful import of enrollments
 */
export interface ImportEnrollmentsResponse {
  success: boolean;
  message: string;
  totalRows: number;
  successfulEnrollments: number;
  failedEnrollments: number;
  errors: string[];
  enrolledCourseIds: string[];
}

/**
 * ⚠️ Standardized error response (used across API)
 */
export interface ApiErrorResponse {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  [key: string]: any;
}

export interface ImportTemplateResponse {
  success: boolean;
  file: Blob;
  fileName: string;
  contentType: string;
}

export interface ImportStudentsTemplateResponse {
  success: boolean;
  file: Blob;
  fileName: string;
  contentType: string;
}

export interface ImportStudentsSpecificCourseResponse {
  success: boolean;
  message: string;
  totalRows: number;
  successfulEnrollments: number;
  failedEnrollments: number;
  errors: string[];
  courseId: string;
  courseName: string;
}

export interface EnrollmentInfo {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  studentId: string;
  studentName: string;
  joinedAt: string;
  unenrolledAt?: string | null;
  status: number;
  unenrollmentReason?: string | null;
  createdAt: string;
}

/** 🧑‍🎓 Response khi join course */
export interface JoinCourseResponse {
  success: boolean;
  message: string;
  enrollmentId: string;
  enrollment: EnrollmentInfo;
}

/** 🚪 Response khi leave course */
export interface LeaveCourseResponse {
  success: boolean;
  message: string;
  unenrolledStudent: EnrollmentInfo;
}

/** ✅ Một khóa học mà user đã ghi danh */
export interface MyEnrolledCourse {
  courseId: string;
  courseCode: string;
  courseName: string;
  description?: string;
  lecturerName: string;
  term?: string;
  year?: number;
  joinedAt: string;
  enrollmentId: string;
  enrollmentCount: number;
  department?: string;
}

/** ✅ Response khi gọi /api/enrollments/my-courses */
export interface GetMyEnrolledCoursesResponse {
  success: boolean;
  message: string;
  courses: MyEnrolledCourse[];
  totalCount: number;
}
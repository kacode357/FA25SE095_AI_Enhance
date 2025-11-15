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
  createdStudentEmails: string[];
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
  studentsCreated: number;
  errors: string[];
  createdStudentEmails: string[];
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
  status: EnrollmentStatus;
  unenrollmentReason?: string | null;
  createdAt: string;
}

/**
 * Enrollment status values used across the frontend and backend.
 */
export enum EnrollmentStatus {
  Active = 1,
  Inactive = 2,
  Withdrawn = 3,
  Suspended = 4,
  Completed = 5,
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

// --- Course enrolled students (for a specific course) ---
export interface CourseEnrolledStudent {
  studentId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  studentIdNumber: string;
  profilePictureUrl: string;
  joinedAt: string;        // ISO string
  status: EnrollmentStatus;          // use EnrollmentStatus enum
  enrollmentId: string;
}

export interface GetCourseEnrolledStudentsResponse {
  success: boolean;
  message: string;
  courseId: string;
  courseName: string;
  students: CourseEnrolledStudent[];
  totalStudents: number;
}

// types/enrollments/unenroll-student.response.ts
export interface UnenrolledStudent {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  studentId: string;
  studentName: string;
  joinedAt: string;
  unenrolledAt: string;
  status: number;
  unenrollmentReason: string;
  createdAt: string;
}

export interface UnenrollStudentResponse {
  success: boolean;
  message: string;
  unenrolledStudent: UnenrolledStudent;
}

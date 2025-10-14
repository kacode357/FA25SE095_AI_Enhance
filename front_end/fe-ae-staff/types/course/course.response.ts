// types/course/course.response.ts

export interface Course {
  id: string;
  courseCode: string;
  courseCodeTitle: string;
  name: string;
  description: string;
  term: string;
  year: number;
  lecturerId: string;
  lecturerName: string;
  createdAt: string;
  enrollmentCount: number;
  status: number;
  approvedBy: string | null;
  approvedByName: string | null;
  approvedAt: string | null;
  approvalComments: string | null;
  rejectionReason: string | null;
  canEnroll: boolean;
  requiresAccessCode: boolean;
  accessCode: string | null;
  accessCodeCreatedAt: string | null;
  accessCodeExpiresAt: string | null;
  isAccessCodeExpired: boolean;
  department: string;
}

/** ✅ GET /api/Courses/all */
export interface GetAllCoursesResponse {
  success: boolean;
  message: string;
  courses: Course[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/** ✅ GET /api/Courses/{id} */
export interface GetCourseByIdResponse {
  success: boolean;
  message: string;
  course: Course;
}

/** ✅ PUT /api/Courses/{id}/approve */
export interface ApproveCourseResponse {
  success: boolean;
  message: string;
  course: Course;
}

/** ✅ PUT /api/Courses/{id}/reject */
export interface RejectCourseResponse {
  success: boolean;
  message: string;
  course: Course;
}

export interface Enrollment {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  studentId: string;
  studentName: string;
  joinedAt: string;
  unenrolledAt: string | null;
  status: number; // 1 = Active, 2 = Unenrolled, ...
  unenrollmentReason: string | null;
  createdAt: string;
}

/** ✅ GET /api/Courses/{id}/enrollments */
export interface GetCourseEnrollmentsResponse {
  success: boolean;
  message: string;
  course: Course;
  enrollments: Enrollment[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
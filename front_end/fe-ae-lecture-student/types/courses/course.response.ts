export enum CourseStatus {
  PendingApproval = 1,
  Active = 2,
  Inactive = 3,
  Rejected = 4,
}

export interface CourseItem {
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
  requiresAccessCode: boolean;
  accessCode: string | null;
  accessCodeCreatedAt: string | null;
  accessCodeExpiresAt: string | null;
  isAccessCodeExpired: boolean;
  department: string;
  /** Course status per backend enum */
  status?: CourseStatus;
}

export interface CreateCourseResponse {
  success: boolean;
  message: string;
  courseId: string;
  course: CourseItem;
}

export interface GetMyCoursesResponse {
  success: boolean;
  message: string;
  courses: CourseItem[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface UpdateCourseResponse {
  success: boolean;
  message: string;
  updatedCourse: UpdatedCourseItems;
}
export interface UpdatedCourseItems {
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
  approvedBy: string;
  approvedByName: string;
  approvedAt: string;
  approvalComments: string;
  rejectionReason: string;
  canEnroll: boolean;
  requiresAccessCode: boolean;
  accessCode: string;
  accessCodeCreatedAt: string;
  accessCodeExpiresAt: string;
  isAccessCodeExpired: boolean;
  department: string;
}

export interface GetCourseByIdResponse {
  success: boolean;
  message: string;
  course: GetCourseByIdItems;
}
export interface GetCourseByIdItems {
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
  approvedBy: string;
  approvedByName: string | null;
  approvedAt: string;
  approvalComments: string | null;
  rejectionReason: string | null;
  canEnroll: boolean;
  requiresAccessCode: boolean;
  accessCode: string | null;
  accessCodeCreatedAt: string | null;
  accessCodeExpiresAt: string | null;
  isAccessCodeExpired: boolean | null;
  department: string;
}


export interface DeleteCourseResponse {
  success: boolean;
  message: string;
}

export interface UpdateAccessCodeResponse {
  success: boolean;
  message: string;
  accessCode: string | null;
  accessCodeCreatedAt: string | null;
  accessCodeExpiresAt: string | null;
}

export interface GetCourseEnrollmentsResponse {
  success: boolean;
  message: string;
  course: CourseItem;
  enrollments: Enrollment[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
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

export interface EnrollmentStatus {
  isEnrolled: boolean;
  joinedAt: string | null;
  status: string | null;
}

/** ✅ Available course item cho student */
export interface AvailableCourseItem {
  id: string;
  courseCode: string;
  name: string;
  lecturerId: string;
  lecturerName: string;
  createdAt: string;
  enrollmentCount: number;
  requiresAccessCode: boolean;
  isAccessCodeExpired: boolean;
  enrollmentStatus: EnrollmentStatus | null;
  canJoin: boolean;
  joinUrl: string | null;
}

/** ✅ Response GET /api/Courses/available */
export interface GetAvailableCoursesResponse {
  success: boolean;
  message: string;
  courses: AvailableCourseItem[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

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
  img: string;
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
   isEnrolled: boolean;
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

/** ✅ Available course item cho student (khớp API /api/Courses/available) */
export interface AvailableCourseItem {
  id: string;
  courseCode: string;
  /** Tên hiển thị (Data Analysis & Visualization, Web Development 101, ...) */
  name: string;
  /** Mô tả khoá học */
  description: string;
  lecturerId: string;
  lecturerName: string;
  createdAt: string;
  enrollmentCount: number;
  requiresAccessCode: boolean;
  isAccessCodeExpired: boolean;

  /** Ảnh thumbnail chung của course; backend có thể trả null */
  img: string | null;

  /** 🔹 Mã unique riêng của course (F24002, F24001, ...) */
  uniqueCode: string;

  /** 🔹 Avatar giảng viên nếu có, null nếu chưa set */
  lecturerImage: string | null;

  /** 🔹 Thời gian bắt đầu/kết thúc term (string ISO) */
  termStartDate: string;
  termEndDate: string;

  /** Trạng thái enrollment của current student, hoặc null nếu chưa join */
  enrollmentStatus: EnrollmentStatus | null;

  /** Có được phép join (theo rule backend) */
  canJoin: boolean;

  /** Link join trực tiếp; có thể null khi không đủ điều kiện */
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

export interface InactivateCourseResponse {
  success: boolean;
  message: string;
  courseId: string;
}

export interface UploadCourseImageResponse {
  success: boolean;
  message: string;
  imageUrl: string;
}

export interface DeleteCourseImageResponse {
  success: boolean;
  message: string;
}

export interface CoursesByTermYearItem {
  id: string;
  courseCode: string;
  uniqueCode: string;
  courseCodeTitle: string;
  name: string;
  description: string;
  term: string;
  termStartDate: string;
  termEndDate: string;
  lecturerId: string;
  lecturerName: string;
  lecturerImage: string | null;
  createdAt: string;
  enrollmentCount: number;
  status: CourseStatus | number;
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
  img: string | null;
  department: string | null;
}

/** ✅ Response GET /api/Courses/by-term-year */
export interface GetCoursesByTermYearResponse {
  success: boolean;
  message: string;
  courses: CoursesByTermYearItem[];

  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;

  /** Tên term tương ứng với termId */
  termName: string;
}
export interface CourseByUniqueCodeItem {
  id: string;
  courseCode: string;
  uniqueCode: string;
  courseCodeTitle: string;
  name: string;
  description: string;
  term: string;
  termStartDate: string;
  termEndDate: string;
  lecturerId: string;
  lecturerName: string;
  lecturerImage: string | null;
  createdAt: string;
  enrollmentCount: number;
  status: CourseStatus | number;
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
  img: string | null;
  department: string | null;
}

/** ✅ Response GET /api/Courses/by-code/{uniqueCode} */
export interface GetCourseByUniqueCodeResponse {
  success: boolean;
  message: string;
  course: CourseByUniqueCodeItem;
  /** Current user đã enroll course này chưa */
  isEnrolled: boolean;
}

/** 🆕 Course item cho join-info – tái dùng cấu trúc CourseByUniqueCodeItem */
export type CourseJoinInfoItem = CourseByUniqueCodeItem;

/** 🆕 Response GET /api/Courses/{id}/join-info */
export interface GetCourseJoinInfoResponse {
  success: boolean;
  message: string;
  course: CourseJoinInfoItem;
  /** Current user đã enroll course này chưa */
  isEnrolled: boolean;
}
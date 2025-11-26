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
  announcement?: string | null;
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
  termStartDate?: string | null;
  termEndDate?: string | null;
  syllabusFile?: string | null;
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
  termStartDate?: string | null;
  termEndDate?: string | null;
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
  syllabusFile?: string | null;
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
  announcement?: string | null;
  term: string;
  year: number;
  uniqueCode: string;
  lecturerImage: string | null;
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
  termStartDate?: string | null;
  termEndDate?: string | null;
  syllabusFile?: string | null;
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
  syllabusFile?: string | null;
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
  status: number;
  unenrollmentReason: string | null;
  createdAt: string;
}

export interface EnrollmentStatus {
  isEnrolled: boolean;
  joinedAt: string | null;
  status: string | null;
}

export interface AvailableCourseItem {
  id: string;
  courseCode: string;
  name: string;
  description: string;
  announcement: string | null;
  lecturerId: string;
  lecturerName: string;
  createdAt: string;
  enrollmentCount: number;
  requiresAccessCode: boolean;
  isAccessCodeExpired: boolean;
  img: string | null;
  uniqueCode: string;
  lecturerImage: string | null;
  termStartDate: string;
  termEndDate: string;
  enrollmentStatus: EnrollmentStatus | null;
  canJoin: boolean;
  joinUrl: string | null;
}

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
  announcement?: string | null;
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

export interface GetCoursesByTermYearResponse {
  success: boolean;
  message: string;
  courses: CoursesByTermYearItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  termName: string;
}

export interface CourseByUniqueCodeItem {
  id: string;
  courseCode: string;
  uniqueCode: string;
  courseCodeTitle: string;
  name: string;
  description: string;
  announcement?: string | null;
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

export interface GetCourseByUniqueCodeResponse {
  success: boolean;
  message: string;
  course: CourseByUniqueCodeItem;
  isEnrolled: boolean;
}

export type CourseJoinInfoItem = CourseByUniqueCodeItem;

export interface GetCourseJoinInfoResponse {
  success: boolean;
  message: string;
  course: CourseJoinInfoItem;
  isEnrolled: boolean;
}

export interface GetCourseStatisticsResponse {
  success: boolean;
  message: string;
  statistics: CourseStatistics;
}

export interface CourseStatistics {
  course: Course;
  totalEnrollments: number;
  totalAssignments: number;
  totalGroups: number;
  totalChatMessages: number;
  totalNotifications: number;
  recentEnrollments: number;
  lastActivity: string | null;
  enrollmentsByMonth: Record<string, number>;
}

export interface Course {
  id: string;
  courseCode: string;
  courseCodeTitle: string;
  name: string;
  description: string;
  announcement?: string | null;
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

export interface UploadSyllabusResponse {
  success: boolean;
  message: string;
  fileUrl: string;
}

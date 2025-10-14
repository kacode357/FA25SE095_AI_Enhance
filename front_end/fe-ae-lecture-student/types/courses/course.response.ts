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
  updatedCourse: CourseItem;
}

export interface GetCourseByIdResponse {
  success: boolean;
  message: string;
  course: CourseItem;
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

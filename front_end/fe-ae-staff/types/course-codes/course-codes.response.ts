// types/course-codes/course-codes.response.ts

export interface CourseCode {
  id: string;
  code: string;
  title: string;
  description: string;
  isActive: boolean;
  department: string;
  createdAt: string;
  updatedAt: string;
  activeCoursesCount: number;
  totalCoursesCount: number;
}

export interface CreateCourseCodeResponse {
  success: boolean;
  message: string;
  courseCodeId: string;
  courseCode: CourseCode;
}

export interface GetCourseCodesResponse {
  success: boolean;
  message: string;
  courseCodes: CourseCode[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GetCourseCodeByIdResponse {
  success: boolean;
  message: string;
  courseCode: CourseCode;
}

export interface UpdateCourseCodeResponse {
  success: boolean;
  message: string;
  courseCode: CourseCode;
}

export interface DeleteCourseCodeResponse {
  success: boolean;
  message: string;
}

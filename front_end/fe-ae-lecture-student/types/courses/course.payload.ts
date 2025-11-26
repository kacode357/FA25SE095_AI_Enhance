export interface CreateCoursePayload {
  courseCodeId: string;
  description: string;
  termId: string;
  year: number;
  announcement?: string | null;
  requiresAccessCode: boolean;
  accessCodeType?: number;
  customAccessCode?: string;
  accessCodeExpiresAt?: string;
}

export interface UpdateCoursePayload {
  courseId: string;
  description: string;
  announcement?: string | null;
  termId: string;
  year: number;
}

export interface GetMyCoursesQuery {
  asLecturer: boolean;
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

export interface UpdateAccessCodeRequest {
  requiresAccessCode: boolean;
  accessCodeType?: number;
  customAccessCode?: string;
  expiresAt?: string;
  regenerateCode?: boolean;
}

export interface GetCourseEnrollmentsQuery {
  page?: number;
  pageSize?: number;
  studentName?: string;
  sortDirection?: "asc" | "desc";
}

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

export interface InactivateCoursePayload {
  courseId: string;
  lecturerId: string;
  reason: string;
}

export interface UploadCourseImageRequest {
  courseId: string;
  image: File;
}

export interface DeleteCourseImageRequest {
  courseId: string;
}

export interface GetCoursesByTermYearQuery {
  termId: string;
  status?: number;
  lecturerId?: string;
  courseCode?: string;
  page?: number;
  pageSize?: number;
  sortBy?: "Name" | "CourseCode" | "EnrollmentCount" | "CreatedAt";
  sortDirection?: "asc" | "desc";
}

export interface GetCourseByUniqueCodePayload {
  uniqueCode: string;
}

export interface GetCourseJoinInfoPayload {
  courseId: string;
}

export interface UploadSyllabusPayload {
  file: File;
}

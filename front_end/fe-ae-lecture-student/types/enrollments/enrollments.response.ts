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

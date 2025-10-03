// types/courses/course.response.ts

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
  enrollmentStatus: {
    isEnrolled: boolean;
    joinedAt?: string;
    status?: string;
  };
  canJoin: boolean;
  joinUrl: string;
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

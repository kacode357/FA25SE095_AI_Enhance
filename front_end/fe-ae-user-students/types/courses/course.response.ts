// types/courses/course.response.ts

export interface EnrollmentInfo {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  studentId: string;
  studentName: string;
  joinedAt: string;
  unenrolledAt?: string | null;
  status: number;
  unenrollmentReason?: string | null;
  createdAt: string;
}

export interface JoinCourseResponse {
  success: boolean;
  message: string;
  enrollmentId: string;
  enrollment: EnrollmentInfo;
}

export interface LeaveCourseResponse {
  success: boolean;
  message: string;
  unenrolledStudent: EnrollmentInfo;
}

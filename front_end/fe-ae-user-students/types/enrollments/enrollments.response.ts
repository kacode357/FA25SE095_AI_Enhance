// types/enrollments/enrollments.response.ts

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

/** Response khi join course */
export interface JoinCourseResponse {
  success: boolean;
  message: string;
  enrollmentId: string;
  enrollment: EnrollmentInfo;
}

/** Response khi leave course */
export interface LeaveCourseResponse {
  success: boolean;
  message: string;
  unenrolledStudent: EnrollmentInfo;
}

/** Response khi check enrollment status */
export interface EnrollmentStatusResponse {
  success: boolean;
  message: string;
  isEnrolled: boolean;
  status: number;
  joinedAt?: string;
  course: {
    id: string;
    courseCode: string;
    name: string;
    lecturerName: string;
  };
}


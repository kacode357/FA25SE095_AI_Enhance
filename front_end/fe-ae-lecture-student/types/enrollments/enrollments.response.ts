export interface ImportEnrollmentsResponse {
  success: boolean;
  message: string;
  totalRows: number;
  successfulEnrollments: number;
  failedEnrollments: number;
  errors: string[];
  enrolledCourseIds: string[];
  createdStudentEmails: string[];
}

export interface ApiErrorResponse {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  [key: string]: any;
}

export interface ImportTemplateResponse {
  success: boolean;
  file: Blob;
  fileName: string;
  contentType: string;
}

export interface ImportStudentsTemplateResponse {
  success: boolean;
  file: Blob;
  fileName: string;
  contentType: string;
}

export interface ImportStudentsSpecificCourseResponse {
  success: boolean;
  message: string;
  totalRows: number;
  successfulEnrollments: number;
  failedEnrollments: number;
  studentsCreated: number;
  errors: string[];
  createdStudentEmails: string[];
  courseId: string;
  courseName: string;
}

export interface EnrollmentInfo {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  studentId: string;
  studentName: string;
  joinedAt: string;
  unenrolledAt?: string | null;
  status: EnrollmentStatus;
  unenrollmentReason?: string | null;
  createdAt: string;
}

export enum EnrollmentStatus {
  Active = 1,
  Inactive = 2,
  Withdrawn = 3,
  Suspended = 4,
  Completed = 5,
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

export interface MyEnrolledCourse {
  courseId: string;
  courseCode: string;
  courseName: string;
  description?: string;
  lecturerName: string;
  term?: string;
  year?: number;
  joinedAt: string;
  enrollmentId: string;
  enrollmentCount: number;
  department?: string;
}

export interface GetMyEnrolledCoursesResponse {
  success: boolean;
  message: string;
  courses: MyEnrolledCourse[];
  totalCount: number;
}

export interface CourseEnrolledStudent {
  studentId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  studentIdNumber: string;
  profilePictureUrl: string;
  joinedAt: string;
  status: EnrollmentStatus;
  enrollmentId: string;
}

export interface GetCourseEnrolledStudentsResponse {
  success: boolean;
  message: string;
  courseId: string;
  courseName: string;
  students: CourseEnrolledStudent[];
  totalStudents: number;
}

export interface EnrollmentStudentDetail {
  studentId: string;
  studentName: string;
  email: string;
  enrolledAt: string; // ISO datetime
  status: string;
  groupId?: string | null;
  groupName?: string | null;
  isGroupLeader?: boolean;
}

export interface GetEnrollmentStudentResponse {
  success: boolean;
  message: string;
  student: EnrollmentStudentDetail | null;
}

export interface UnenrolledStudent {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  studentId: string;
  studentName: string;
  joinedAt: string;
  unenrolledAt: string;
  status: number;
  unenrollmentReason: string;
  createdAt: string;
}

export interface UnenrollStudentResponse {
  success: boolean;
  message: string;
  unenrolledStudent: UnenrolledStudent;
}

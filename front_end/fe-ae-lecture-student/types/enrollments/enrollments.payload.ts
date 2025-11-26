export interface ImportEnrollmentsPayload {
  file: File;
  courseIds?: string[];
  createAccountIfNotFound: boolean;
}

export interface ImportStudentsSpecificCoursePayload {
  courseId: string;
  file: File;
  createAccountIfNotFound: boolean;
}

export interface JoinCoursePayload {
  accessCode?: string;
}

export interface UnenrollStudentPayload {
  reason: string;
}

export interface UnenrollStudentParams {
  courseId: string;
  studentId: string;
}

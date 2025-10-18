export interface ImportEnrollmentsPayload {
  file: File;
  courseIds?: string[];
}

export interface ImportStudentsSpecificCoursePayload {
  courseId: string;
  file: File;
}

/** ✅ Payload khi sinh viên join course */
export interface JoinCoursePayload {
  accessCode?: string;
}

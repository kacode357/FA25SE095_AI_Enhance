// types/enrollments/enrollments.payload.ts

/** Payload khi join course */
export interface JoinCoursePayload {
  accessCode?: string;
}

/** Payload khi leave course */
export interface LeaveCoursePayload {
  reason?: string; // optional: nếu cần lý do unenroll
}

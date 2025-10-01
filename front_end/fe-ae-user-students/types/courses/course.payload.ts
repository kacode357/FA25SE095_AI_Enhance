// types/courses/course.payload.ts

/** Payload khi join course */
export interface JoinCoursePayload {
  accessCode?: string;
}

/** Payload khi leave course
 * BE hiện tại không yêu cầu body,
 * nhưng vẫn khai báo để đồng bộ structure
 */
export interface LeaveCoursePayload {
  reason?: string; // optional: nếu sau này có lý do unenroll
}

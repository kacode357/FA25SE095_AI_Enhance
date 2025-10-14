// config/course-request-status.ts

/**
 * ✅ Đồng bộ với backend enum
 * namespace ClassroomService.Domain.Enums;
 * public enum CourseRequestStatus
 * {
 *   Pending = 1,
 *   Approved = 2,
 *   Rejected = 3,
 *   Cancelled = 4
 * }
 */

export enum CourseRequestStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
  Cancelled = 4,
}

/** Hiển thị tên status */
export const CourseRequestStatusText: Record<CourseRequestStatus, string> = {
  [CourseRequestStatus.Pending]: "Pending",
  [CourseRequestStatus.Approved]: "Approved",
  [CourseRequestStatus.Rejected]: "Rejected",
  [CourseRequestStatus.Cancelled]: "Cancelled",
};

/** Hiển thị màu status (dùng cho text hoặc badge) */
export const CourseRequestStatusColor: Record<CourseRequestStatus, string> = {
  [CourseRequestStatus.Pending]: "text-yellow-600",
  [CourseRequestStatus.Approved]: "text-green-600",
  [CourseRequestStatus.Rejected]: "text-red-600",
  [CourseRequestStatus.Cancelled]: "text-gray-500",
};

/**
 * ✅ Helper để ép kiểu an toàn khi convert number → enum
 */
export function getCourseRequestStatusColor(status?: number): string {
  const s = status as CourseRequestStatus;
  return CourseRequestStatusColor[s] ?? "text-slate-500";
}

export function getCourseRequestStatusText(status?: number): string {
  const s = status as CourseRequestStatus;
  return CourseRequestStatusText[s] ?? "Unknown";
}

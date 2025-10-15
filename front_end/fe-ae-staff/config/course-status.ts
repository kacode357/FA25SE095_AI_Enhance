// config/course-status.ts

/**
 * ✅ Đồng bộ với backend enum:
 * namespace ClassroomService.Domain.Enums;
 * public enum CourseStatus
 * {
 *   PendingApproval = 1,
 *   Active = 2,
 *   Inactive = 3,
 *   Rejected = 4
 * }
 */

export enum CourseStatus {
  PendingApproval = 1,
  Active = 2,
  Inactive = 3,
  Rejected = 4,
}

/** Hiển thị tên status */
export const CourseStatusText: Record<CourseStatus, string> = {
  [CourseStatus.PendingApproval]: "Pending Approval",
  [CourseStatus.Active]: "Active",
  [CourseStatus.Inactive]: "Inactive",
  [CourseStatus.Rejected]: "Rejected",
};

/** Hiển thị màu status (dùng cho text hoặc badge) */
export const CourseStatusColor: Record<CourseStatus, string> = {
  [CourseStatus.PendingApproval]: "text-yellow-600",
  [CourseStatus.Active]: "text-green-600",
  [CourseStatus.Inactive]: "text-gray-500",
  [CourseStatus.Rejected]: "text-red-600",
};

/** Helpers an toàn khi nhận number từ API */
export function getCourseStatusText(status?: number): string {
  const s = status as CourseStatus;
  return CourseStatusText[s] ?? "Unknown";
}

export function getCourseStatusColor(status?: number): string {
  const s = status as CourseStatus;
  return CourseStatusColor[s] ?? "text-slate-500";
}

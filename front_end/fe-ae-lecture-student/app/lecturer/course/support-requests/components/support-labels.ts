import { SupportRequestCategory } from "@/config/classroom-service/support-request-category.enum";
import { SupportRequestPriority } from "@/config/classroom-service/support-request-priority.enum";
import { SupportRequestStatus } from "@/config/classroom-service/support-request-status.enum";

export const statusLabelMap: Record<number, string> = {
  [SupportRequestStatus.Pending]: "Pending",
  [SupportRequestStatus.InProgress]: "In Progress",
  [SupportRequestStatus.Resolved]: "Resolved",
  [SupportRequestStatus.Cancelled]: "Cancelled",
  [SupportRequestStatus.Rejected]: "Rejected",
};

export const statusColorMap: Record<number, string> = {
  [SupportRequestStatus.Pending]:
    "badge-support-status badge-support-status--pending",
  [SupportRequestStatus.InProgress]:
    "badge-support-status badge-support-status--in-progress",
  [SupportRequestStatus.Resolved]:
    "badge-support-status badge-support-status--resolved",
  [SupportRequestStatus.Cancelled]:
    "badge-support-status badge-support-status--cancelled",
  [SupportRequestStatus.Rejected]:
    "badge-support-status badge-support-status--rejected",
};

export const categoryLabelMap: Record<number, string> = {
  [SupportRequestCategory.Technical]: "Technical",
  [SupportRequestCategory.Academic]: "Academic",
  [SupportRequestCategory.Administrative]: "Administrative",
  [SupportRequestCategory.Other]: "Other",
};

export const priorityLabelMap: Record<number, string> = {
  [SupportRequestPriority.Low]: "Low",
  [SupportRequestPriority.Medium]: "Medium",
  [SupportRequestPriority.High]: "High",
  [SupportRequestPriority.Urgent]: "Urgent",
};

export const categoryColorMap: Record<number, string> = {
  [SupportRequestCategory.Technical]:
    "badge-support-category badge-support-category--technical",
  [SupportRequestCategory.Academic]:
    "badge-support-category badge-support-category--academic",
  [SupportRequestCategory.Administrative]:
    "badge-support-category badge-support-category--administrative",
  [SupportRequestCategory.Other]:
    "badge-support-category badge-support-category--other",
};

export const priorityColorMap: Record<number, string> = {
  [SupportRequestPriority.Low]: "badge-support-priority badge-support-priority--low",
  [SupportRequestPriority.Medium]: "badge-support-priority badge-support-priority--medium",
  [SupportRequestPriority.High]: "badge-support-priority badge-support-priority--high",
  [SupportRequestPriority.Urgent]: "badge-support-priority badge-support-priority--urgent",
};

export function statusLabel(status: number) {
  return statusLabelMap[status] ?? `Unknown (${status})`;
}

/** ✅ Helper để lấy class màu */
export function statusColor(status: number) {
  return statusColorMap[status] ?? "badge-support-status";
}

export function categoryLabel(category: number) {
  return categoryLabelMap[category] ?? `Unknown (${category})`;
}

export function priorityLabel(priority: number) {
  return priorityLabelMap[priority] ?? `Unknown (${priority})`;
}

export function categoryColor(category: number) {
  return categoryColorMap[category] ?? "badge-support-category";
}

export function priorityColor(priority: number) {
  return priorityColorMap[priority] ?? "bg-gray-100 text-gray-700";
}

export const formatDateTime = (s?: string | null) => {
  if (!s) return "";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s || "";
  return d.toLocaleString("en-GB");
};

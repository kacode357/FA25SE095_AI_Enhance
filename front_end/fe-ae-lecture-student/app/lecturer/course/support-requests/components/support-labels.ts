import { SupportRequestCategory } from "@/config/classroom-service/support-request-category.enum";
import { SupportRequestStatus } from "@/config/classroom-service/support-request-status.enum";

export enum SupportRequestPriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Urgent = 3
}

export const statusLabelMap: Record<number, string> = {
  [SupportRequestStatus.Pending]: "Pending",
  [SupportRequestStatus.Accepted]: "Accepted",
  [SupportRequestStatus.InProgress]: "In Progress",
  [SupportRequestStatus.Resolved]: "Resolved",
  [SupportRequestStatus.Cancelled]: "Cancelled",
};

export const statusColorMap: Record<number, string> = {
  [SupportRequestStatus.Pending]: "bg-yellow-100 text-yellow-800",
  [SupportRequestStatus.Accepted]: "bg-blue-100 text-blue-800",
  [SupportRequestStatus.InProgress]: "bg-purple-100 text-purple-800",
  [SupportRequestStatus.Resolved]: "bg-green-100 text-green-800",
  [SupportRequestStatus.Cancelled]: "bg-red-100 text-red-800",
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
  [SupportRequestCategory.Technical]: "bg-indigo-100 text-indigo-800",
  [SupportRequestCategory.Academic]: "bg-blue-100 text-blue-800",
  [SupportRequestCategory.Administrative]: "bg-amber-100 text-amber-800",
  [SupportRequestCategory.Other]: "bg-gray-100 text-gray-800",
};

export const priorityColorMap: Record<number, string> = {
  [SupportRequestPriority.Low]: "bg-green-100 text-green-800",
  [SupportRequestPriority.Medium]: "bg-sky-100 text-sky-800",
  [SupportRequestPriority.High]: "bg-yellow-100 text-yellow-800",
  [SupportRequestPriority.Urgent]: "bg-red-100 text-red-800",
};

export function statusLabel(status: number) {
  return statusLabelMap[status] ?? `Unknown (${status})`;
}

/** ✅ Helper để lấy class màu */
export function statusColor(status: number) {
  return statusColorMap[status] ?? "bg-gray-100 text-gray-700";
}

export function categoryLabel(category: number) {
  return categoryLabelMap[category] ?? `Unknown (${category})`;
}

export function priorityLabel(priority: number) {
  return priorityLabelMap[priority] ?? `Unknown (${priority})`;
}

export function categoryColor(category: number) {
  return categoryColorMap[category] ?? "bg-gray-100 text-gray-700";
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

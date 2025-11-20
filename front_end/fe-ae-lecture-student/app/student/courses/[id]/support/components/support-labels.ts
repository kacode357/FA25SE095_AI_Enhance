// app/student/courses/[id]/support/components/support-labels.ts

import { SupportRequestStatus } from "@/config/classroom-service/support-request-status.enum";
import { SupportRequestCategory } from "@/config/classroom-service/support-request-category.enum";

/** Frontend-only priority enum (backend returns numeric values) */
export enum SupportRequestPriority {
  Low = 0,
  Medium = 1,
  High = 2,
}

/** Never show raw enum numbers in UI, only English labels */
export const statusLabelMap: Record<number, string> = {
  [SupportRequestStatus.Pending]: "Pending",
  [SupportRequestStatus.InProgress]: "In Progress",
  [SupportRequestStatus.Resolved]: "Resolved",
  [SupportRequestStatus.Cancelled]: "Cancelled",
  [SupportRequestStatus.Rejected]: "Rejected",
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
};

export function statusLabel(status: number) {
  return statusLabelMap[status] ?? `Unknown (${status})`;
}

export function categoryLabel(category: number) {
  return categoryLabelMap[category] ?? `Unknown (${category})`;
}

export function priorityLabel(priority: number) {
  return priorityLabelMap[priority] ?? `Unknown (${priority})`;
}

export const formatDateTime = (s?: string | null) => {
  if (!s) return "";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s || "";
  return d.toLocaleString("en-GB");
};

// app/student/courses/[id]/support/components/support-labels.ts

import { SupportRequestCategory } from "@/config/classroom-service/support-request-category.enum";
import { SupportRequestPriority } from "@/config/classroom-service/support-request-priority.enum";
import { SupportRequestRejectionReason } from "@/config/classroom-service/support-request-rejection-reason.enum";
import { SupportRequestStatus } from "@/config/classroom-service/support-request-status.enum";
import { formatDateTimeVN } from "@/utils/datetime/format-datetime";

/** Never show raw enum numbers in UI, only English labels */
export const statusLabelMap: Record<SupportRequestStatus, string> = {
  [SupportRequestStatus.Pending]: "Pending",
  [SupportRequestStatus.InProgress]: "In Progress",
  [SupportRequestStatus.Resolved]: "Resolved",
  [SupportRequestStatus.Cancelled]: "Cancelled",
  [SupportRequestStatus.Rejected]: "Rejected",
};

export const categoryLabelMap: Record<SupportRequestCategory, string> = {
  [SupportRequestCategory.Technical]: "Technical",
  [SupportRequestCategory.Academic]: "Academic",
  [SupportRequestCategory.Administrative]: "Administrative",
  [SupportRequestCategory.Other]: "Other",
};

export const priorityLabelMap: Record<SupportRequestPriority, string> = {
  [SupportRequestPriority.Low]: "Low",
  [SupportRequestPriority.Medium]: "Medium",
  [SupportRequestPriority.High]: "High",
  [SupportRequestPriority.Urgent]: "Urgent",
};

export const rejectionReasonLabelMap: Record<SupportRequestRejectionReason, string> =
  {
    [SupportRequestRejectionReason.InsufficientPermissions]:
      "Insufficient permissions",
    [SupportRequestRejectionReason.RequireHigherAuth]: "Requires higher auth",
    [SupportRequestRejectionReason.OutOfScope]: "Out of scope",
    [SupportRequestRejectionReason.DuplicateRequest]: "Duplicate request",
    [SupportRequestRejectionReason.Other]: "Other",
  };

export function statusLabel(status: number) {
  return statusLabelMap[status as SupportRequestStatus] ?? `Unknown (${status})`;
}

export function categoryLabel(category: number) {
  return (
    categoryLabelMap[category as SupportRequestCategory] ??
    `Unknown (${category})`
  );
}

export function priorityLabel(priority: number) {
  return (
    priorityLabelMap[priority as SupportRequestPriority] ??
    `Unknown (${priority})`
  );
}

export function rejectionReasonLabel(reason?: number | null) {
  if (reason == null) return "";
  return (
    rejectionReasonLabelMap[reason as SupportRequestRejectionReason] ??
    `Unknown (${reason})`
  );
}

/** Dùng chung – giờ Việt Nam, dùng util */
export const formatDateTime = (value?: string | null): string => {
  return formatDateTimeVN(value);
};

/* ===== CSS BADGE CLASS HELPERS (dùng file app/styles/*.css) ===== */

const statusBadgeClassMap: Record<SupportRequestStatus, string> = {
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

const categoryBadgeClassMap: Record<SupportRequestCategory, string> = {
  [SupportRequestCategory.Technical]:
    "badge-support-category badge-support-category--technical",
  [SupportRequestCategory.Academic]:
    "badge-support-category badge-support-category--academic",
  [SupportRequestCategory.Administrative]:
    "badge-support-category badge-support-category--administrative",
  [SupportRequestCategory.Other]:
    "badge-support-category badge-support-category--other",
};

const rejectionBadgeClassMap: Record<SupportRequestRejectionReason, string> = {
  [SupportRequestRejectionReason.InsufficientPermissions]:
    "badge-support-rejection badge-support-rejection--insufficient-permissions",
  [SupportRequestRejectionReason.RequireHigherAuth]:
    "badge-support-rejection badge-support-rejection--require-higher-auth",
  [SupportRequestRejectionReason.OutOfScope]:
    "badge-support-rejection badge-support-rejection--out-of-scope",
  [SupportRequestRejectionReason.DuplicateRequest]:
    "badge-support-rejection badge-support-rejection--duplicate-request",
  [SupportRequestRejectionReason.Other]:
    "badge-support-rejection badge-support-rejection--other",
};

const priorityBadgeClassMap: Record<SupportRequestPriority, string> = {
  [SupportRequestPriority.Low]:
    "badge-support-priority badge-support-priority--low",
  [SupportRequestPriority.Medium]:
    "badge-support-priority badge-support-priority--medium",
  [SupportRequestPriority.High]:
    "badge-support-priority badge-support-priority--high",
  [SupportRequestPriority.Urgent]:
    "badge-support-priority badge-support-priority--urgent",
};

export function statusBadgeClass(status: number): string {
  return (
    statusBadgeClassMap[status as SupportRequestStatus] ??
    "badge-support-status"
  );
}

export function categoryBadgeClass(category: number): string {
  return (
    categoryBadgeClassMap[category as SupportRequestCategory] ??
    "badge-support-category"
  );
}

export function rejectionBadgeClass(reason?: number | null): string {
  if (reason == null) return "badge-support-rejection";
  return (
    rejectionBadgeClassMap[reason as SupportRequestRejectionReason] ??
    "badge-support-rejection"
  );
}

export function priorityBadgeClass(priority: number): string {
  return (
    priorityBadgeClassMap[priority as SupportRequestPriority] ??
    "badge-support-priority"
  );
}

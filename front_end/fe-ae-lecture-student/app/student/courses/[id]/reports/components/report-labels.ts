// app/student/courses/[id]/reports/components/report-labels.ts
"use client";

import { ReportStatus } from "@/config/classroom-service/report-status.enum";

/** Convert value (number|string) -> ReportStatus enum hoặc null */
export function toReportStatus(value: number | string): ReportStatus | null {
  if (typeof value === "number") {
    if (value >= 1 && value <= 8) return value as ReportStatus;
    return null;
  }

  const normalized = value.trim().toLowerCase();
  switch (normalized) {
    case "draft":
      return ReportStatus.Draft;
    case "submitted":
      return ReportStatus.Submitted;
    case "underreview":
    case "under review":
      return ReportStatus.UnderReview;
    case "requiresrevision":
    case "requires revision":
      return ReportStatus.RequiresRevision;
    case "resubmitted":
      return ReportStatus.Resubmitted;
    case "graded":
      return ReportStatus.Graded;
    case "late":
      return ReportStatus.Late;
    case "rejected":
      return ReportStatus.Rejected;
    default:
      return null;
  }
}

export type ReportStatusMeta = {
  label: string;
  className: string;
};

/**
 * Trả về cả label + CSS class cho status
 * => logic map status chỉ nằm 1 chỗ
 */
export function getReportStatusMeta(value: number | string): ReportStatusMeta {
  const status = toReportStatus(value);

  if (!status) {
    return {
      label: String(value),
      className: "badge-report",
    };
  }

  switch (status) {
    case ReportStatus.Draft:
      return {
        label: "Draft",
        className: "badge-report badge-report--draft",
      };
    case ReportStatus.Submitted:
      return {
        label: "Submitted",
        className: "badge-report badge-report--submitted",
      };
    case ReportStatus.UnderReview:
      return {
        label: "Under review",
        className: "badge-report badge-report--under-review",
      };
    case ReportStatus.RequiresRevision:
      return {
        label: "Requires revision",
        className: "badge-report badge-report--requires-revision",
      };
    case ReportStatus.Resubmitted:
      return {
        label: "Resubmitted",
        className: "badge-report badge-report--resubmitted",
      };
    case ReportStatus.Graded:
      return {
        label: "Graded",
        className: "badge-report badge-report--graded",
      };
    case ReportStatus.Late:
      return {
        label: "Late",
        className: "badge-report badge-report--late",
      };
    case ReportStatus.Rejected:
      return {
        label: "Rejected",
        className: "badge-report badge-report--rejected",
      };
    default:
      return {
        label: String(value),
        className: "badge-report",
      };
  }
}

/** Nếu chỗ nào chỉ cần label hoặc class thì xài 2 hàm này (wrapper từ meta) */
export function reportStatusLabel(value: number | string): string {
  return getReportStatusMeta(value).label;
}

export function reportStatusBadgeClass(value: number | string): string {
  return getReportStatusMeta(value).className;
}

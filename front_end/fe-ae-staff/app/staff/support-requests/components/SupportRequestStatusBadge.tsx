// app/staff/support-requests/components/SupportRequestStatusBadge.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { SupportRequestStatus } from "@/config/classroom-service/support-request-status.enum";

type Props = {
  status: number;
};

const STATUS_LABEL: Record<number, string> = {
  [SupportRequestStatus.Pending]: "Pending",
  [SupportRequestStatus.InProgress]: "In progress",
  [SupportRequestStatus.Resolved]: "Resolved",
  [SupportRequestStatus.Cancelled]: "Cancelled",
  [SupportRequestStatus.Rejected]: "Rejected",
};

export default function SupportRequestStatusBadge({ status }: Props) {
  const classMap: Record<number, string> = {
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

  return (
    <Badge
      variant="outline"
      className={
        classMap[status] ??
        "badge-support-status px-2.5 py-0.5 text-xs font-medium rounded-full"
      }
    >
      {STATUS_LABEL[status] ?? `Unknown (${status})`}
    </Badge>
  );
}

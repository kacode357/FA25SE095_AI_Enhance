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
  let colorClass = "bg-gray-100 text-gray-700 border-none";

  switch (status) {
    case SupportRequestStatus.Pending:
      colorClass = "bg-amber-50 text-amber-700 border border-amber-100";
      break;
    case SupportRequestStatus.InProgress:
      colorClass = "bg-blue-50 text-blue-700 border border-blue-100";
      break;
    case SupportRequestStatus.Resolved:
      colorClass = "bg-emerald-50 text-emerald-700 border border-emerald-100";
      break;
    case SupportRequestStatus.Cancelled:
      colorClass = "bg-slate-50 text-slate-700 border border-slate-100";
      break;
    case SupportRequestStatus.Rejected:
      colorClass = "bg-red-50 text-red-700 border border-red-100";
      break;
  }

  return (
    <Badge
      variant="outline"
      className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${colorClass}`}
    >
      {STATUS_LABEL[status] ?? `Unknown (${status})`}
    </Badge>
  );
}

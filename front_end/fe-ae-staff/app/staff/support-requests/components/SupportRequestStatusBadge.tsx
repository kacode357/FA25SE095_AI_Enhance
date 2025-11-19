// app/staff/support-requests/components/SupportRequestStatusBadge.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import type { SupportRequestStatus } from "@/types/support/support-request.response";

type Props = {
  status: SupportRequestStatus;
};

const STATUS_LABEL: Record<SupportRequestStatus, string> = {
  0: "Pending",
  1: "Accepted",
  2: "In progress",
  3: "Resolved",
  4: "Cancelled",
};

export default function SupportRequestStatusBadge({ status }: Props) {
  let colorClass = "bg-gray-100 text-gray-700 border-none";

  switch (status) {
    case 0: // Pending
      colorClass = "bg-amber-50 text-amber-700 border border-amber-100";
      break;
    case 1: // Accepted
    case 2: // InProgress
      colorClass = "bg-blue-50 text-blue-700 border border-blue-100";
      break;
    case 3: // Resolved
      colorClass = "bg-emerald-50 text-emerald-700 border border-emerald-100";
      break;
    case 4: // Cancelled
      colorClass = "bg-red-50 text-red-700 border border-red-100";
      break;
  }

  return (
    <Badge
      variant="outline"
      className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${colorClass}`}
    >
      {STATUS_LABEL[status] ?? "Unknown"}
    </Badge>
  );
}

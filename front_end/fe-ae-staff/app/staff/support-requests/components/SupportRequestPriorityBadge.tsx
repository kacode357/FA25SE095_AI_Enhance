// app/staff/support-requests/components/SupportRequestPriorityBadge.tsx
"use client";

import { Badge } from "@/components/ui/badge";

type Props = {
  priority: number;
};

function getPriorityLabel(priority: number) {
  switch (priority) {
    case 1:
      return "Low";
    case 2:
      return "Medium";
    case 3:
      return "High";
    case 4:
      return "Urgent";
    default:
      return "Normal";
  }
}

export default function SupportRequestPriorityBadge({ priority }: Props) {
  let colorClass = "bg-slate-50 text-slate-700 border border-slate-100";

  switch (priority) {
    case 1:
      colorClass = "bg-emerald-50 text-emerald-700 border border-emerald-100";
      break;
    case 2:
      colorClass = "bg-blue-50 text-blue-700 border border-blue-100";
      break;
    case 3:
      colorClass = "bg-amber-50 text-amber-700 border border-amber-100";
      break;
    case 4:
      colorClass = "bg-red-50 text-red-700 border border-red-100";
      break;
  }

  return (
    <Badge
      variant="outline"
      className={`px-2.5 py-0.5 text-xs rounded-full ${colorClass}`}
    >
      {getPriorityLabel(priority)}
    </Badge>
  );
}

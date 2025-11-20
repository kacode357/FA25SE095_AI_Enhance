// app/staff/support-requests/components/SupportRequestPriorityBadge.tsx
"use client";

import { Badge } from "@/components/ui/badge";

type Props = {
  priority: number; // 0 = Low, 1 = Medium, 2 = High
};

const PRIORITY_LABEL: Record<number, string> = {
  0: "Low",
  1: "Medium",
  2: "High",
};

export default function SupportRequestPriorityBadge({ priority }: Props) {
  let colorClass = "bg-slate-50 text-slate-700 border border-slate-100";

  switch (priority) {
    case 0: // Low
      colorClass = "bg-emerald-50 text-emerald-700 border border-emerald-100";
      break;
    case 1: // Medium
      colorClass = "bg-blue-50 text-blue-700 border border-blue-100";
      break;
    case 2: // High
      colorClass = "bg-amber-50 text-amber-700 border border-amber-100";
      break;
  }

  return (
    <Badge
      variant="outline"
      className={`px-2.5 py-0.5 text-xs rounded-full ${colorClass}`}
    >
      {PRIORITY_LABEL[priority] ?? `Priority ${priority}`}
    </Badge>
  );
}

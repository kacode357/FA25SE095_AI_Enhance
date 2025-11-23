// app/staff/support-requests/components/SupportRequestPriorityBadge.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { SupportRequestPriority } from "@/config/classroom-service/support-request-priority.enum";

type Props = {
  priority: number; // 0 = Low, 1 = Medium, 2 = High, 3 = Urgent
};

const PRIORITY_LABEL: Record<number, string> = {
  0: "Low",
  1: "Medium",
  2: "High",
  3: "Urgent",
};

const PRIORITY_CLASS: Record<number, string> = {
  [SupportRequestPriority.Low]: "badge-support-priority--low",
  [SupportRequestPriority.Medium]: "badge-support-priority--medium",
  [SupportRequestPriority.High]: "badge-support-priority--high",
  [SupportRequestPriority.Urgent]: "badge-support-priority--urgent",
};

export default function SupportRequestPriorityBadge({ priority }: Props) {
  const modifier = PRIORITY_CLASS[priority as SupportRequestPriority];
  const className = modifier
    ? `badge-support-priority ${modifier}`
    : "badge-support-priority";

  return (
    <Badge variant="outline" className={className}>
      {PRIORITY_LABEL[priority] ?? `Priority ${priority}`}
    </Badge>
  );
}

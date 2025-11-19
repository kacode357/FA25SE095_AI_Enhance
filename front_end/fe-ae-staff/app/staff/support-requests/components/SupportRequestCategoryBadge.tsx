// app/staff/support-requests/components/SupportRequestCategoryBadge.tsx
"use client";

import { Badge } from "@/components/ui/badge";

type Props = {
  category: number;
};

const CATEGORY_LABEL: Record<number, string> = {
  0: "Technical",
  1: "Academic",
  2: "Administrative",
  3: "Other",
};

export default function SupportRequestCategoryBadge({ category }: Props) {
  let colorClass = "bg-gray-50 text-gray-700 border border-gray-100";

  switch (category) {
    case 0:
      colorClass = "bg-sky-50 text-sky-700 border border-sky-100";
      break;
    case 1:
      colorClass = "bg-indigo-50 text-indigo-700 border border-indigo-100";
      break;
    case 2:
      colorClass = "bg-purple-50 text-purple-700 border border-purple-100";
      break;
    case 3:
      colorClass = "bg-slate-50 text-slate-700 border border-slate-100";
      break;
  }

  return (
    <Badge
      variant="outline"
      className={`px-2.5 py-0.5 text-xs rounded-full ${colorClass}`}
    >
      {CATEGORY_LABEL[category] ?? "Unknown"}
    </Badge>
  );
}

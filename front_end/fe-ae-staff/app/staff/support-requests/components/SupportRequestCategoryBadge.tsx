// app/staff/support-requests/components/SupportRequestCategoryBadge.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { SupportRequestCategory } from "@/config/classroom-service/support-request-category.enum";

type Props = {
  category: number;
};

const CATEGORY_LABEL: Record<number, string> = {
  [SupportRequestCategory.Technical]: "Technical",
  [SupportRequestCategory.Academic]: "Academic",
  [SupportRequestCategory.Administrative]: "Administrative",
  [SupportRequestCategory.Other]: "Other",
};

export default function SupportRequestCategoryBadge({ category }: Props) {
  let colorClass = "bg-gray-50 text-gray-700 border border-gray-100";

  switch (category) {
    case SupportRequestCategory.Technical:
      colorClass = "bg-sky-50 text-sky-700 border border-sky-100";
      break;
    case SupportRequestCategory.Academic:
      colorClass = "bg-indigo-50 text-indigo-700 border border-indigo-100";
      break;
    case SupportRequestCategory.Administrative:
      colorClass = "bg-purple-50 text-purple-700 border border-purple-100";
      break;
    case SupportRequestCategory.Other:
      colorClass = "bg-slate-50 text-slate-700 border border-slate-100";
      break;
  }

  return (
    <Badge
      variant="outline"
      className={`px-2.5 py-0.5 text-xs rounded-full ${colorClass}`}
    >
      {CATEGORY_LABEL[category] ?? `Unknown (${category})`}
    </Badge>
  );
}

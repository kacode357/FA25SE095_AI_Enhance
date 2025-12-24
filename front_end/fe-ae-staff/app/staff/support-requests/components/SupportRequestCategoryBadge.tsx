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
  const classMap: Record<number, string> = {
    [SupportRequestCategory.Technical]:
      "badge-support-category badge-support-category--technical",
    [SupportRequestCategory.Academic]:
      "badge-support-category badge-support-category--academic",
    [SupportRequestCategory.Administrative]:
      "badge-support-category badge-support-category--administrative",
    [SupportRequestCategory.Other]:
      "badge-support-category badge-support-category--other",
  };

  return (
    <Badge
      variant="outline"
      className={
        classMap[category] ??
        "badge-support-category px-2.5 py-0.5 text-xs rounded-full"
      }
    >
      {CATEGORY_LABEL[category] ?? `Unknown (${category})`}
    </Badge>
  );
}

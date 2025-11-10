// app/student/courses/[id]/assignments/components/ViewReportButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";

type Props = {
  courseId: string;
  reportId: string;
  className?: string;
  label?: string;
};

export default function ViewReportButton({
  courseId,
  reportId,
  className = "btn bg-white border border-brand text-nav hover:text-nav-active",
  label = "View My Report",
}: Props) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={className}
      onClick={() => router.push(`/student/courses/${courseId}/reports/${reportId}`)}
      title="View your current report"
    >
      <FileText className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}

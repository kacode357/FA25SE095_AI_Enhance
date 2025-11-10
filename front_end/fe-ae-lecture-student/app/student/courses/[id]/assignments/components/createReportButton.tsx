// app/student/courses/[id]/assignments/components/CreateReportButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { Loader2, FileText } from "lucide-react";
import { useCreateReport } from "@/hooks/reports/useCreateReport";

type Props = {
  courseId: string;
  assignmentId: string;
  assignmentTitle?: string;      // ⬅️ thêm để set submission
  groupId?: string | null;
  isGroupSubmission?: boolean;   // default false
  className?: string;
  label?: string;                 // default "Create Report"
  onCreated?: (reportId: string) => void;
};

export default function CreateReportButton({
  courseId,
  assignmentId,
  assignmentTitle,
  groupId = null,
  isGroupSubmission = false,
  className = "btn btn-gradient px-5 py-2",
  label = "Create Report",
  onCreated,
}: Props) {
  const router = useRouter();
  const { createReport, loading } = useCreateReport();

  const handleClick = async () => {
    if (loading) return;

    const res = await createReport({
      assignmentId,
      groupId: groupId ?? undefined,
      // ⬇️ submission theo yêu cầu
      submission: `Report: ${assignmentTitle ?? ""}`,
      isGroupSubmission,
    });

    const reportId = res?.reportId;
    if (reportId) {
      onCreated?.(reportId);
      router.push(`/student/courses/${courseId}/reports/${reportId}`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        className={className}
        onClick={handleClick}
        disabled={loading}
        title="Create Report for this assignment"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Creating…</span>
          </>
        ) : (
          <>
            <FileText className="w-4 h-4" />
            <span>{label}</span>
          </>
        )}
      </button>
    </div>
  );
}

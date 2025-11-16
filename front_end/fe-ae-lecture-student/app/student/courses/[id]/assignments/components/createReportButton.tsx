// app/student/courses/[id]/assignments/components/CreateReportButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { Loader2, FileText } from "lucide-react";
import { useCreateReport } from "@/hooks/reports/useCreateReport";

type Props = {
  courseId: string;
  assignmentId: string;
  assignmentTitle?: string;    
  groupId?: string | null;       
  isGroupSubmission?: boolean;   
  className?: string;
  label?: string;               
  onCreated?: (reportId: string) => void;
};

export default function CreateReportButton({
  courseId,
  assignmentId,
  assignmentTitle,
  groupId = null,
  isGroupSubmission,
  className = "btn btn-gradient px-5 py-2",
  label = "Create Report",
  onCreated,
}: Props) {
  const router = useRouter();
  const { createReport, loading } = useCreateReport();

  const handleClick = async () => {
    if (loading) return;

    try {
      const payload: any = {
        assignmentId,
        submission: `Report: ${assignmentTitle ?? ""}`,
      };

      if (groupId) {
        payload.groupId = groupId;
      }
      if (typeof isGroupSubmission === "boolean") {
        payload.isGroupSubmission = isGroupSubmission;
      }

      const res = await createReport(payload);
      const reportId = (res as any)?.reportId;

      if (!reportId) {
        // Không có reportId thì coi như lỗi business, hook đã show toast.
        return;
      }

      onCreated?.(reportId);
      router.push(`/student/courses/${courseId}/reports/${reportId}`);
    } catch {
      // useCreateReport tự lo toast error rồi, ở đây không cần thêm
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

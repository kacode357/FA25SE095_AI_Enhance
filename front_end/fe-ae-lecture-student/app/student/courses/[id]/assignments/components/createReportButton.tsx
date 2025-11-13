// app/student/courses/[id]/assignments/components/CreateReportButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Loader2, FileText, AlertCircle } from "lucide-react";
import { useCreateReport } from "@/hooks/reports/useCreateReport";

type Props = {
  courseId: string;
  assignmentId: string;
  assignmentTitle?: string;      // dùng để set submission
  groupId?: string | null;
  isGroupSubmission?: boolean;   // default false
  className?: string;
  label?: string;                // default "Create Report"
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

  const disabledByMissingGroup = isGroupSubmission && !groupId;
  const [showGroupDialog, setShowGroupDialog] = useState(false);

  const handleClick = async () => {
    if (loading) return;

    // Bài nhóm nhưng chưa có groupId => show dialog
    if (disabledByMissingGroup) {
      setShowGroupDialog(true);
      return;
    }

    const res = await createReport({
      assignmentId,
      groupId: groupId ?? undefined,
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
    <>
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          className={className} // dùng .btn + .btn-gradient từ globals.css
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

      {/* Dialog Radix UI cho case chưa được phân nhóm */}
      <AlertDialog.Root open={showGroupDialog} onOpenChange={setShowGroupDialog}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
          <AlertDialog.Content
            className="
              fixed left-1/2 top-1/2 z-50 
              w-[90%] max-w-sm 
              -translate-x-1/2 -translate-y-1/2 
              card p-6 
              focus:outline-none
            "
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>

              <AlertDialog.Title className="text-base font-semibold text-nav">
                Groups not assigned yet
              </AlertDialog.Title>

              <AlertDialog.Description className="text-sm text-slate-600">
                Please wait for your lecturer to assign groups before creating a report.
              </AlertDialog.Description>

              <div className="mt-4 flex justify-center">
                <AlertDialog.Action asChild>
                  <button
                    type="button"
                    className="btn btn-gradient-slow px-5"
                  >
                    OK
                  </button>
                </AlertDialog.Action>
              </div>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
}

"use client";

import { useCallback } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSubmitDraftReport } from "@/hooks/reports/useSubmitDraftReport";
import { useUploadReportFile } from "@/hooks/reports/useUploadReportFile";
import { ReportStatus } from "@/types/reports/reports.response";

type Props = {
  reportId: string;
  status: number;
  fileUrl: string | null;
  /** File selected by user but not uploaded yet */
  pendingFile: File | null;
  disabled?: boolean;
  onSubmitted?: () => void;
};

export default function SubmitDraftButton({
  reportId,
  status,
  fileUrl,
  pendingFile,
  disabled,
  onSubmitted,
}: Props) {
  const { submitDraft, loading: submitting } = useSubmitDraftReport();
  const { uploadFile, loading: uploading } = useUploadReportFile();

  const canSubmit =
    status === ReportStatus.Draft ||
    status === ReportStatus.RequiresRevision;

  const isProcessing = submitting || uploading;

  const handleClick = useCallback(async () => {
    if (!canSubmit) {
      toast.error(
        "Only reports in Draft or Requires revision status can be submitted."
      );
      return;
    }

    if (disabled || isProcessing) return;

    // Có chọn file mới thì upload trước, không thì bỏ qua vẫn submit được
    if (pendingFile) {
      await uploadFile(reportId, pendingFile);
      // Nếu lỗi, interceptor đã xử lý toast
      toast.success("File uploaded successfully.");
    }

    const res = await submitDraft(reportId);
    if (res?.success) {
      toast.success(res.message || "Report submitted for grading.");
      onSubmitted?.();
    }
  }, [
    canSubmit,
    disabled,
    isProcessing,
    pendingFile,
    reportId,
    submitDraft,
    uploadFile,
    onSubmitted,
  ]);

  return (
    <Button
      type="button"
      size="sm"
      className="btn-green-slow text-xs sm:text-sm px-4 py-2 rounded-xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
      disabled={disabled || !canSubmit || isProcessing}
      onClick={handleClick}
      title={
        canSubmit
          ? "Submit draft (file optional)"
          : "Only Draft or Requires revision status can be submitted"
      }
    >
      <CheckCircle2 className="w-4 h-4 mr-1" />
      Submit draft
    </Button>
  );
}

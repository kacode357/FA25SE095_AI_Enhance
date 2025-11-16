// app/student/courses/[id]/reports/submit/components/SubmitDraftButton.tsx
"use client";

import { useCallback } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSubmitDraftReport } from "@/hooks/reports/useSubmitDraftReport";
import { ReportStatus } from "@/types/reports/reports.response";

type Props = {
  reportId: string;
  status: number;
  disabled?: boolean;
  onSubmitted?: () => void;
};

export default function SubmitDraftButton({
  reportId,
  status,
  disabled,
  onSubmitted,
}: Props) {
  const { submitDraft, loading } = useSubmitDraftReport();

  const canSubmit = status === ReportStatus.Draft;

  const handleClick = useCallback(async () => {
    if (!canSubmit) {
      toast.error("Only draft reports can be submitted.");
      return;
    }

    try {
      const res = await submitDraft(reportId);
      if (res?.success) {
        toast.success(res.message || "Report submitted for grading.");
        onSubmitted?.();
      } else {
        toast.error(res?.message || "Failed to submit report.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit report.");
    }
  }, [canSubmit, onSubmitted, reportId, submitDraft]);

  return (
    <Button
      type="button"
      size="sm"
      className="bg-brand text-white hover:bg-brand/90"
      disabled={disabled || loading || !canSubmit}
      onClick={handleClick}
      title={
        canSubmit
          ? "Submit this draft for grading"
          : "Only Draft status can be submitted"
      }
    >
      <CheckCircle2 className="w-4 h-4 mr-1" />
      Submit draft
    </Button>
  );
}

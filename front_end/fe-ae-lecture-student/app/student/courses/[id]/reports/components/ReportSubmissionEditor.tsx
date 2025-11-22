// app/student/courses/[id]/reports/components/ReportSubmissionEditor.tsx
"use client";

import { useRef } from "react";
import { Info } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import LiteRichTextEditor from "@/components/common/TinyMCE";
import ReportCollabClient from "./ReportCollabClient";
import type { ReportDetail } from "@/types/reports/reports.response";
import { ReportStatus } from "@/config/classroom-service/report-status.enum";
import { Button } from "@/components/ui/button";
import { useUpdateReport } from "@/hooks/reports/useUpdateReport";
import type { UpdateReportPayload } from "@/types/reports/reports.payload";

type Props = {
  report: ReportDetail;
  html: string;
  onChange: (value: string) => void;
  getAccessToken: () => Promise<string> | string;
};

export default function ReportSubmissionEditor({
  report,
  html,
  onChange,
  getAccessToken,
}: Props) {
  const tinyEditorRef = useRef<any>(null);
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const courseId = params.id;
  const assignmentId = report.assignmentId;

  const isGroupSubmission = !!report.isGroupSubmission;
  const isSubmitted = report.status === ReportStatus.Submitted;
  const isResubmitted = report.status === ReportStatus.Resubmitted;

  // 🔒 Những trạng thái không cho sửa nội dung:
  // - Submitted
  // - Resubmitted
  const isLocked = isSubmitted || isResubmitted;

  // Chỉ dùng hub khi: group submission + chưa locked
  const useHubCollab = isGroupSubmission && !isLocked;
  // Editor read-only khi locked
  const readOnly = isLocked;

  // ====== SAVE (UPDATE REPORT) ======
  const { updateReport, loading: saving } = useUpdateReport();

  const handleSave = async () => {
    if (!report.id) return;

    const payload: UpdateReportPayload = {
      // tuỳ spec của mày, nhưng chắc chắn phải có submission
      submission: html,
    } as UpdateReportPayload;

    const res = await updateReport(report.id, payload);

    if (res?.success) {
      // Reload lại report detail (version, updatedAt, v.v.)
      router.refresh();
    }
  };

  const handleGoToSubmitPage = () => {
    if (!courseId || !assignmentId) return;

    router.push(
      `/student/courses/${courseId}/reports/submit?assignmentId=${assignmentId}`
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Info banner */}
      <div className="rounded-xl p-3 border border-slate-200 bg-slate-50 text-slate-700 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-2 max-w-xl">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="text-xs">
            {isLocked ? (
              isResubmitted ? (
                <>
                  This report has been <b>resubmitted</b>. You can view the
                  content but further edits are disabled.
                </>
              ) : (
                <>
                  This report has been <b>submitted</b>. You can view the
                  content but further edits are disabled.
                </>
              )
            ) : isGroupSubmission ? (
              <>
                Edit the <b>submission</b> below. Your changes will sync in real
                time with other collaborators.
              </>
            ) : (
              <>
                This is an <b>individual</b> submission. Live collaboration is
                disabled for this report.
              </>
            )}
          </div>
        </div>

        {/* Chỉ render hub khi được phép → group + không locked */}
        {useHubCollab && (
          <div className="md:flex-shrink-0">
            <ReportCollabClient
              reportId={report.id}
              getAccessToken={getAccessToken}
              html={html}
              onRemoteHtml={(newHtml) => {
                onChange(newHtml);
                tinyEditorRef.current?.pushContentFromOutside?.(newHtml);
              }}
              getEditorRoot={() => tinyEditorRef.current?.getRoot?.() ?? null}
            />
          </div>
        )}
      </div>

      {/* Editor phần submission */}
      <LiteRichTextEditor
        value={html}
        onChange={readOnly ? () => {} : onChange}
        readOnly={readOnly}
        placeholder={
          readOnly ? "Report content (read only)" : "Write your report here..."
        }
        className="w-full"
        onInit={(api: any) => {
          tinyEditorRef.current = api;
          if (html) {
            api.pushContentFromOutside?.(html);
          }
        }}
      />

      {/* Save + Submit – chỉ hiện khi chưa locked */}
      {!isLocked && (
        <div className="mt-2 flex gap-2 justify-end">
          <Button
            variant="outline"
            className="h-9 px-3 text-xs rounded-xl"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? "Saving…" : "Save"}
          </Button>

          <Button
            onClick={handleGoToSubmitPage}
            className="btn-green-slow h-9 px-4 text-sm rounded-xl"
            disabled={saving}
          >
            Submit report
          </Button>
        </div>
      )}
    </div>
  );
}

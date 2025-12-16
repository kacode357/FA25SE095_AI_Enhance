// app/student/courses/[id]/reports/components/ReportSubmissionEditor.tsx
"use client";

import { Info } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import LiteRichTextEditor from "@/components/common/TinyMCE";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReportStatus } from "@/config/classroom-service/report-status.enum";
import { useUpdateReport } from "@/hooks/reports/useUpdateReport";
import type { UpdateReportPayload } from "@/types/reports/reports.payload";
import type { ReportDetail } from "@/types/reports/reports.response";
import ReportCollabClient from "./ReportCollabClient";

type Props = {
  report: ReportDetail;
  html: string;
  onChange: (value: string) => void;
  getAccessToken: () => Promise<string> | string;
};

const buildSavedKey = (reportId: string) => `report:${reportId}:saved-once`;

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

  // ref giữ html mới nhất, tránh closure bị cũ
  const htmlRef = useRef(html);
  useEffect(() => {
    htmlRef.current = html;
  }, [html]);

  // ref giữ nội dung đã save lần gần nhất → tránh gọi API khi không đổi
  const lastSavedHtmlRef = useRef<string | null>(null);

  // ref + localStorage: từng save ít nhất 1 lần chưa (chỉ meaningful cho individual)
  const hasSavedRef = useRef(false);

  // Dialog báo cần save trước khi submit
  const [saveRequiredOpen, setSaveRequiredOpen] = useState(false);

  useEffect(() => {
    if (!report.id || typeof window === "undefined") return;
    const key = buildSavedKey(report.id);
    if (window.localStorage.getItem(key) === "1") {
      hasSavedRef.current = true;
    }
  }, [report.id]);

  const markSaved = () => {
    hasSavedRef.current = true;
    if (typeof window !== "undefined" && report.id) {
      const key = buildSavedKey(report.id);
      window.localStorage.setItem(key, "1");
    }
  };

  const clearSavedFlag = () => {
    if (typeof window !== "undefined" && report.id) {
      const key = buildSavedKey(report.id);
      window.localStorage.removeItem(key);
    }
    hasSavedRef.current = false;
  };

  const internalSave = async (opts?: { isAuto?: boolean }) => {
    if (!report.id) return;

    const currentHtml = htmlRef.current ?? "";
    // Không cần gọi API nếu nội dung không đổi

    if (currentHtml === lastSavedHtmlRef.current) return;

    const payload: UpdateReportPayload = {
      submission: currentHtml,
    };

    const res = await updateReport(report.id, payload);

    if (res?.success) {
      // lastSavedHtmlRef.current = htmlToSave;
      markSaved();
      // Không toast ở đây, hook / chỗ khác lo UI
      router.refresh();
    }
  };

  const handleSave = async () => {
    // Manual save
    await internalSave({ isAuto: false });
  };

  // ⏱ Auto save mỗi 1 phút (chỉ individual + chưa locked)
  useEffect(() => {
    if (isLocked || isGroupSubmission || !report.id) return;
    if (typeof window === "undefined") return;

    const intervalId = window.setInterval(() => {
      void internalSave({ isAuto: true });
    }, 60_000); // 1 phút

    return () => {
      window.clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLocked, isGroupSubmission, report.id]);

  const hasSavedOnce = () => {
    if (hasSavedRef.current) return true;
    if (typeof window === "undefined" || !report.id) return false;

    const key = buildSavedKey(report.id);
    return window.localStorage.getItem(key) === "1";
  };

  const handleGoToSubmitPage = () => {
    if (!courseId || !assignmentId) return;

    // ✅ Chỉ individual mới bị bắt buộc save
    if (!isGroupSubmission && !hasSavedOnce()) {
      setSaveRequiredOpen(true);
      return;
    }

    // Đã được phép submit → xoá flag localStorage trước khi chuyển trang
    clearSavedFlag();

    router.push(
      `/student/courses/${courseId}/reports/submit?assignmentId=${assignmentId}`
    );
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Info banner */}
        <div className="rounded-xl flex flex-col p-3 border border-slate-200 bg-slate-50 text-slate-700 gap-3 md:flex-row md:items-center md:justify-between">
          <div
            className={`flex items-start gap-2 ${
              isGroupSubmission ? "max-w-xl" : "w-full"
            }`}
          >
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="text-xs">
              {isLocked ? (
                isResubmitted ? (
                  <>
                    This report has been <b>resubmitted</b>. You can view
                    the content but further edits are disabled.
                  </>
                ) : (
                  <>
                    This report has been <b>submitted</b>. You can view the
                    content but further edits are disabled.
                  </>
                )
              ) : isGroupSubmission ? (
                <>
                  Edit the <b>submission</b> below. Your changes will sync in
                  real time with other collaborators.
                </>
              ) : (
                <>
                  This is an <b>individual</b> submission. Your report will{" "}
                  <b>auto-save every 1 minute</b>. You can also use the{" "}
                  <b>Save</b> button to save immediately before submitting.
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
                getEditorRoot={() =>
                  tinyEditorRef.current?.getRoot?.() ?? null
                }
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
            readOnly
              ? "Report content (read only)"
              : "Write your report here..."
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
            {/* ❗ Individual submission mới có nút Save */}
            {!isGroupSubmission && (
              <Button
                variant="outline"
                className="h-9 px-3 text-xs rounded-xl"
                disabled={saving}
                onClick={handleSave}
              >
                {saving ? "Saving…" : "Save"}
              </Button>
            )}

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

      {/* Dialog: yêu cầu user save trước khi submit */}
      <Dialog open={saveRequiredOpen} onOpenChange={setSaveRequiredOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save required</DialogTitle>
            <DialogDescription>
              Please save your report at least once (or wait for auto-save){" "}
              before submitting. This helps ensure your latest content is
              stored safely.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              onClick={() => setSaveRequiredOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

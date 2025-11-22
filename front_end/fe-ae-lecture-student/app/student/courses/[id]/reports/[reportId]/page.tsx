// app/student/courses/[id]/reports/[reportId]/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Clock,
  FileText,
  Loader2,
  Tag,
  ChevronDown,
  History,
  RotateCcw,
} from "lucide-react";

import { useGetReportById } from "@/hooks/reports/useGetReportById";
import { useUpdateReportStatus } from "@/hooks/reports/useUpdateReportStatus";
import ReportTimeline from "@/app/student/courses/[id]/reports/components/ReportTimeline";
import LiteRichTextEditor from "@/components/common/TinyMCE";
import type { ReportDetail } from "@/types/reports/reports.response";
import { ReportStatus } from "@/types/reports/reports.response";
import { getSavedAccessToken } from "@/utils/auth/access-token";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import ReportSubmissionEditor from "@/app/student/courses/[id]/reports/components/ReportSubmissionEditor";

/** ============ utils ============ */
const dt = (s?: string | null) => {
  if (!s) return "";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString("en-GB");
};

const getAccessToken = async (): Promise<string> =>
  getSavedAccessToken() || "";

export default function ReportDetailPage() {
  const router = useRouter();
  const params = useParams();

  const courseId = typeof params?.id === "string" ? params.id : "";
  const reportId = typeof params?.reportId === "string" ? params.reportId : "";

  const { getReportById, loading } = useGetReportById();
  const { loading: updatingStatus, updateReportStatus } =
    useUpdateReportStatus();

  const [html, setHtml] = useState<string>("");
  const [report, setReport] = useState<ReportDetail | null>(null);
  const didFetchRef = useRef(false);

  const [infoOpen, setInfoOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);

  useEffect(() => {
    if (!reportId || didFetchRef.current) return;
    didFetchRef.current = true;

    (async () => {
      const res = await getReportById(reportId);
      const r = res?.report ?? null;
      setReport(r);

      const safe = r?.submission ?? "";
      setHtml(safe);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

  const handleRevertStatus = async () => {
    if (!report) return;

    let targetStatus: ReportStatus | null = null;
    let comment = "";

    if (report.status === ReportStatus.Submitted) {
      // Submitted -> Draft
      targetStatus = ReportStatus.Draft;
      comment = "Revert submitted report back to draft for further editing.";
    } else if (report.status === ReportStatus.Resubmitted) {
      // Resubmitted -> RequiresRevision
      targetStatus = ReportStatus.RequiresRevision;
      comment =
        "Revert resubmission back to revision state for more changes.";
    }

    if (!targetStatus) return;

    await updateReportStatus(report.id, {
      targetStatus,
      comment,
    });

    // Refetch report to get latest status + content
    const res = await getReportById(reportId);
    const fresh = res?.report ?? null;
    setReport(fresh);
    setHtml(fresh?.submission ?? "");
  };

  if (!reportId) {
    return (
      <div className="py-16 text-center">
        <p className="text-[var(--text-muted)]">
          Không tìm thấy <b>reportId</b> trong URL.
        </p>
        <button
          className="btn mt-4 bg-white border border-brand text-nav hover:text-nav-active"
          onClick={() => router.push(`/student/courses/${courseId}`)}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Course
        </button>
      </div>
    );
  }

  if (loading && !report) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-nav">
        <Loader2 className="w-6 h-6 mr-2 animate-spin text-nav-active" />
        <span className="text-sm">Loading report…</span>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="py-16 text-center">
        <p className="text-[var(--text-muted)]">Report not found.</p>
        <button
          className="btn mt-4 bg-white border border-brand text-nav hover:text-nav-active"
          onClick={() => router.push(`/student/courses/${courseId}`)}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Course
        </button>
      </div>
    );
  }

  const canRevertStatus =
    report.status === ReportStatus.Submitted ||
    report.status === ReportStatus.Resubmitted;

  const revertLabel =
    report.status === ReportStatus.Submitted
      ? "Revert to draft"
      : report.status === ReportStatus.Resubmitted
      ? "Back to revision"
      : "";

  return (
    <>
      <motion.div
        className="flex flex-col gap-6 py-6 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold text-nav flex items-center gap-2">
              <FileText className="w-7 h-7 text-nav-active shrink-0" />
              <span className="truncate" title={report.assignmentTitle}>
                Report — {report.assignmentTitle}
              </span>
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200">
                <CalendarDays className="w-3 h-3" />
                Created: {dt(report.createdAt) || "—"}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200">
                <CalendarDays className="w-3 h-3" />
                Submitted: {dt(report.submittedAt) || "—"}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200">
                <Clock className="w-3 h-3" />
                Graded At: {dt(report.gradedAt) || "—"}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 shrink-0">
            {canRevertStatus && (
              <button
                type="button"
                onClick={handleRevertStatus}
                disabled={updatingStatus}
                className="btn bg-white border border-amber-400 text-xs text-amber-700 hover:bg-amber-50 flex items-center gap-1 disabled:opacity-60"
                title="Revert report status to continue editing"
              >
                {updatingStatus ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                <span>{revertLabel}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setTimelineOpen(true)}
              className="btn bg-white border border-slate-200 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-1"
              title="View activity / version history"
            >
              <History className="w-4 h-4" />
              History
            </button>

            <button
              onClick={() => router.back()}
            className="btn bg-white border border-slate-200 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-1"
              title="Back to Previous Page"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        </div>

        {/* Assignment Info */}
        <Collapsible
          open={infoOpen}
          onOpenChange={setInfoOpen}
          className="card rounded-2xl p-4"
        >
          <CollapsibleTrigger className="w-full flex items-center justify-between text-left">
            <span className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-nav-active" />
              <span className="text-base font-bold text-nav">
                Assignment Info
              </span>
            </span>
            <ChevronDown
              className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${
                infoOpen ? "rotate-180" : ""
              }`}
            />
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-3 text-sm text-foreground/80 space-y-2">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-nav-active" />
              <div>
                <b>Course:</b> {report.courseName || "—"}
              </div>
            </div>
            {report.assignmentDueDate && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-nav-active" />
                <div>
                  <b>Due:</b> {dt(report.assignmentDueDate)}
                </div>
              </div>
            )}
            {report.assignmentDescription && (
              <div className="flex items-start gap-2">
                <BookOpen className="w-4 h-4 text-nav-active mt-0.5" />
                <div className="flex-1">
                  <b>Description</b>
                  <div className="mt-2">
                    <LiteRichTextEditor
                      value={report.assignmentDescription || ""}
                      onChange={() => {}}
                      readOnly
                      className="w-full"
                      placeholder=""
                      debounceMs={0}
                    />
                  </div>
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Submission editor + (optional) live collab */}
        <ReportSubmissionEditor
          report={report}
          html={html}
          onChange={setHtml}
          getAccessToken={getAccessToken}
        />
      </motion.div>

      {/* Dialog xem timeline / version history */}
      <Dialog open={timelineOpen} onOpenChange={setTimelineOpen}>
        <DialogContent className="max-w-2xl sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-4 h-4 text-nav-active" />
              <span>Report activity & versions</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              View the history of submissions, status changes, grading and other
              edits for this report.
            </DialogDescription>
          </DialogHeader>

          {timelineOpen && (
            <div className="mt-2">
              <ReportTimeline reportId={report.id} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

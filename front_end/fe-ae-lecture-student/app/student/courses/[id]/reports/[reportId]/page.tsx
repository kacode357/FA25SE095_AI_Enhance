// app/student/courses/[id]/reports/[reportId]/page.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
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
  X,
} from "lucide-react";

import { useGetReportById } from "@/hooks/reports/useGetReportById";
import { useUpdateReportStatus } from "@/hooks/reports/useUpdateReportStatus";
import ReportTimeline from "@/app/student/courses/[id]/reports/components/ReportHistory";
import LiteRichTextEditor from "@/components/common/TinyMCE";
import type { ReportDetail } from "@/types/reports/reports.response";
import { ReportStatus } from "@/types/reports/reports.response";
import { getSavedAccessToken } from "@/utils/auth/access-token";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import ReportSubmissionEditor from "@/app/student/courses/[id]/reports/components/ReportSubmissionEditor";
import ReportFullHistory from "../components/ReportFullHistory";

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
  const [showFullHistory, setShowFullHistory] = useState(false);

  const refetchReport = useCallback(async () => {
    if (!reportId) return;
    const res = await getReportById(reportId);
    const r = res?.report ?? null;
    setReport(r);
    setHtml(r?.submission ?? "");
  }, [getReportById, reportId]);

  useEffect(() => {
    if (!reportId || didFetchRef.current) return;
    didFetchRef.current = true;

    refetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId, refetchReport]);

  const handleRevertStatus = async () => {
    if (!report) return;

    let targetStatus: ReportStatus | null = null;
    let comment = "";

    if (report.status === ReportStatus.Submitted) {
      targetStatus = ReportStatus.Draft;
      comment = "Revert submitted report back to draft for further editing.";
    } else if (report.status === ReportStatus.Resubmitted) {
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
    await refetchReport();
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

  const handleOpenHistory = () => {
    setShowFullHistory(false); // vào latest trước
    setTimelineOpen(true);
  };

  const handleCloseHistory = () => {
    setTimelineOpen(false);
    setShowFullHistory(false);
  };

  return (
    <>
      {/* MAIN PAGE */}
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
              onClick={handleOpenHistory}
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

        {/* Submission editor */}
        <ReportSubmissionEditor
          report={report}
          html={html}
          onChange={setHtml}
          getAccessToken={getAccessToken}
        />
      </motion.div>

      {/* SIDE HISTORY SCREEN - slide từ PHẢI sang TRÁI */}
      <AnimatePresence>
        {timelineOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col bg-white"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          >
            {/* Header history */}
            <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200">
              {/* Left: title + subtitle */}
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-nav-active" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-nav">
                    Report activity &amp; versions
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {showFullHistory
                      ? "Browse all versions and detailed changes."
                      : "View the latest activity for this report."}
                  </span>
                </div>
              </div>

              {/* Right: actions (See full + Close) – DỒN SANG PHẢI */}
              <div className="flex items-center gap-2">
                {!showFullHistory && (
                  <button
                    type="button"
                    onClick={() => setShowFullHistory(true)}
                    className="btn-blue-slow inline-flex items-center rounded-full px-6 py-2 text-xs font-medium text-white"
                  >
                    See full version history
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCloseHistory}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 text-slate-600"
                  title="Close history"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* Body: full screen content (latest OR full) */}
            <div className="flex-1 overflow-hidden p-2 sm:p-4">
              {showFullHistory ? (
                <ReportFullHistory
                  reportId={report.id}
                  className="h-full"
                  onBackToLatest={() => setShowFullHistory(false)}
                  onRevertSuccess={refetchReport}
                />
              ) : (
                <ReportTimeline reportId={report.id} className="h-full" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

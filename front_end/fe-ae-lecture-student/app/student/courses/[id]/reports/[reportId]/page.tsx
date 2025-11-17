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
  Info,
  Loader2,
  Tag,
  ChevronDown,
  History,
} from "lucide-react";

import { useGetReportById } from "@/hooks/reports/useGetReportById";
import ReportCollabClient from "@/app/student/courses/[id]/reports/components/ReportCollabClient";
import ReportTimeline from "@/app/student/courses/[id]/reports/components/ReportTimeline";
import LiteRichTextEditor from "@/components/common/TinyMCE";
import type { ReportDetail } from "@/types/reports/reports.response";
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

  const [initialHtml, setInitialHtml] = useState<string>("");
  const [html, setHtml] = useState<string>("");

  const [report, setReport] = useState<ReportDetail | null>(null);
  const didFetchRef = useRef(false);

  const [infoOpen, setInfoOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);

  // TinyMCE editor API ref
  const tinyEditorRef = useRef<any>(null);

  useEffect(() => {
    if (!reportId || didFetchRef.current) return;
    didFetchRef.current = true;

    (async () => {
      const res = await getReportById(reportId);
      const r = res?.report ?? null;
      setReport(r);

      const safe = r?.submission ?? "";
      setInitialHtml(safe);
      setHtml(safe);

      tinyEditorRef.current?.pushContentFromOutside?.(safe);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

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
            {/* Nút mở timeline – giống Google Docs “Version history” */}
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
              className="btn bg-white border border-brand text-nav hover:text-nav-active"
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

        {/* Collaboration text + Live collaboration */}
        <div className="rounded-xl p-3 border border-slate-200 bg-slate-50 text-slate-700 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-2 max-w-xl">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="text-xs">
              Edit the <b>submission</b> below. Your changes will sync in real
              time with other collaborators.
            </div>
          </div>

          <div className="md:flex-shrink-0">
            <ReportCollabClient
              reportId={reportId}
              getAccessToken={getAccessToken}
              html={html}
              onRemoteHtml={(newHtml) => {
                setHtml(newHtml);
                tinyEditorRef.current?.pushContentFromOutside?.(newHtml);
              }}
              getEditorRoot={() => tinyEditorRef.current?.getRoot?.() ?? null}
            />
          </div>
        </div>

        {/* Submission editor – KHÔNG card, chỉ khung TinyMCE mặc định */}
        <div className="flex flex-col gap-2">
          <LiteRichTextEditor
            value={initialHtml}
            onChange={(v) => setHtml(v)}
            placeholder="Write your report here..."
            className="w-full"
            onInit={(api: any) => {
              tinyEditorRef.current = api;
              if (initialHtml) {
                api.pushContentFromOutside?.(initialHtml);
              }
            }}
          />
        </div>
      </motion.div>

      {/* Dialog xem timeline / version history giống Google Docs */}
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

          {/* Timeline chỉ mount khi dialog mở ⇒ không spam UI */}
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

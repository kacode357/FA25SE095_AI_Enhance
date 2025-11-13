// app/student/courses/[id]/reports/[reportId]/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Clock,
  FileText,
  Info,
  Loader2,
  Save,
  Tag,
  ChevronDown,
} from "lucide-react";
import Cookies from "js-cookie";

import { useGetReportById } from "@/hooks/reports/useGetReportById";
import { cleanIncomingHtml } from "@/utils/html-normalize";
import ReportCollabClient from "@/app/student/courses/[id]/reports/components/ReportCollabClient";
import LiteRichTextEditor from "@/components/common/TinyMCE";

// ✅ import type rõ ràng để state không bị lỗi
import type { ReportDetail } from "@/types/reports/reports.response";

/** ============ utils ============ */
const dt = (s?: string | null) => {
  if (!s) return "";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString("en-GB");
};
const normalizeHtml = (html: string) => cleanIncomingHtml(html ?? "").trim();

const ACCESS_TOKEN_KEY = "accessToken";
async function getAccessToken(): Promise<string> {
  if (typeof window !== "undefined") {
    const ss = sessionStorage.getItem(ACCESS_TOKEN_KEY);
    if (ss) return ss;
  }
  const ck = Cookies.get(ACCESS_TOKEN_KEY);
  return ck || "";
}

export default function ReportDetailPage() {
  const router = useRouter();
  const params = useParams();

  const courseId = typeof params?.id === "string" ? params.id : "";
  const reportId = typeof params?.reportId === "string" ? params.reportId : "";

  const { getReportById, loading } = useGetReportById();

  // ✅ Phân tách state:
  // `initialHtml`: Chỉ set 1 lần khi fetch, dùng cho `initialValue` của Tiny
  const [initialHtml, setInitialHtml] = useState<string>("");
  // `html`: State "live" khi gõ, dùng để save và gửi collab
  const [html, setHtml] = useState<string>("");

  const [saving, setSaving] = useState<boolean>(false);
  const [saveMsg, setSaveMsg] = useState<string>("");

  // ✅ dùng kiểu tường minh
  const [report, setReport] = useState<ReportDetail | null>(null);
  const didFetchRef = useRef(false);

  const [infoOpen, setInfoOpen] = useState(false);

  // ref giữ TinyMCE editor API để collab client dùng tính caret
  const tinyEditorRef = useRef<any>(null);

  useEffect(() => {
    if (!reportId || didFetchRef.current) return;
    didFetchRef.current = true;

    (async () => {
      const res = await getReportById(reportId); // GetReportResponse | null
      const r = res?.report ?? null;
      setReport(r);

      const safe = normalizeHtml(r?.submission || "");
      setInitialHtml(safe); // ✅ Set initialHtml (cho initialValue)
      setHtml(safe); // ✅ Set html live

      // ✅ FIX (1): Chủ động PUSH data vào editor khi fetch xong
      tinyEditorRef.current?.pushContentFromOutside?.(safe);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

  const handleSave = async () => {
    if (!reportId) return;
    setSaving(true);
    setSaveMsg("");
    try {
      // ✅ Dùng state `html` (live) để save
      const payload = { submission: html };
      const res = await fetch(`/api/reports/${reportId}/submission`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.text()) || "Failed to save");
      
      // ✅ Sau khi save, cập nhật `initialHtml` thành state hiện tại
      setInitialHtml(html);
      setSaveMsg("Saved");
    } catch (err: any) {
      setSaveMsg(err?.message || "Save failed");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 2000);
    }
  };

  const isDirty = useMemo(
    // ✅ So sánh state `html` (live) với `initialHtml` (lần cuối save/load)
    () => normalizeHtml(html) !== normalizeHtml(initialHtml),
    [html, initialHtml]
  );

  if (!reportId) {
    // ... (return như cũ)
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
    // ... (return như cũ)
    return (
      <div className="flex items-center justify-center h-[60vh] text-nav">
        <Loader2 className="w-6 h-6 mr-2 animate-spin text-nav-active" />
        <span className="text-sm">Loading report…</span>
      </div>
    );
  }

  if (!report) {
    // ... (return như cũ)
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
    <motion.div
      className="flex flex-col gap-6 py-6 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Header */}
      {/* ... (Header như cũ) */}
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

        <div className="shrink-0">
          <button
            onClick={() => router.push(`/student/courses/${courseId}`)}
            className="btn bg-white border border-brand text-nav hover:text-nav-active"
            title="Back to Course"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>

      {/* Assignment Info */}
      {/* ... (Assignment Info như cũ) */}
      <div className="card rounded-2xl p-4">
        <button
          type="button"
          className="w-full flex items-center justify-between text-left"
          onClick={() => setInfoOpen((v) => !v)}
        >
          <span className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-nav-active" />
            <span className="text-base font-bold text-nav">Assignment Info</span>
          </span>
          <ChevronDown
            className={`w-5 h-5 text-slate-500 transition-transform ${
              infoOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        <AnimatePresence initial={false}>
          {infoOpen && (
            <motion.div
              key="assign-info"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              style={{ overflow: "hidden" }}
              className="mt-3"
            >
              <div className="text-sm text-foreground/80 space-y-2">
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
                      <div
                        className="prose prose-sm max-w-none text-foreground/80"
                        dangerouslySetInnerHTML={{
                          __html: cleanIncomingHtml(report.assignmentDescription),
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Submission editor (TinyMCE) */}
      <div className="flex flex-col gap-4">
        <div className="card rounded-2xl p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <h2 className="text-lg font-bold text-nav">Submission</h2>
            <div className="flex items-center gap-2">
              <button
                disabled={saving || !isDirty}
                onClick={handleSave}
                className={`btn px-3 py-1.5 ${
                  saving || !isDirty ? "opacity-60 cursor-not-allowed" : "btn-gradient"
                }`}
                title="Save changes"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving…</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </>
                )}
              </button>
              {saveMsg && (
                <span className="text-xs text-[var(--text-muted)]">{saveMsg}</span>
              )}
            </div>
          </div>

          <div className="px-4 py-3">
            <LiteRichTextEditor
              // ✅ Dùng `initialHtml` cho `value` (chỉ load 1 lần)
              value={initialHtml}
              // ✅ `onChange` cập nhật state `html` (live)
              onChange={(v) => setHtml(v)}
              placeholder="Write your report here..."
              className="w-full"
              onInit={(api) => {
                // api = Tiny editor + pushContentFromOutside
                tinyEditorRef.current = api;
                
                // ✅ FIX (2): Xử lý race-condition: Nếu fetch xong TRƯỚC khi
                // editor init xong, thì `initialHtml` đã có giá trị.
                // Push nó vào editor ngay khi init.
                if (initialHtml) {
                  api.pushContentFromOutside?.(initialHtml);
                }
              }}
            />
          </div>
        </div>

        {/* Live collaboration bar + remote caret */}
        <ReportCollabClient
          reportId={reportId}
          getAccessToken={getAccessToken}
          // ✅ Vẫn gửi `html` (state live) đi cho client khác
          html={html}
          onRemoteHtml={(newHtml) => {
            // ✅ FIX (3): Khi có data từ Collab
            // 1. Cập nhật state `html` (live)
            setHtml(newHtml);
            // 2. Chủ động PUSH data đó vào editor
            tinyEditorRef.current?.pushContentFromOutside?.(newHtml);
          }}
          getEditorRoot={() => tinyEditorRef.current?.getRoot?.() ?? null}
        />

        <div className="rounded-xl p-3 border border-slate-200 bg-slate-50 text-slate-700 flex items-start gap-2">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="text-xs">
            Edit <b>Submission</b> trực tiếp ở trên và nhấn <b>Save</b> để lưu. Thay đổi
            sẽ sync realtime với cộng tác viên khác.
          </div>
        </div>
      </div>
    </motion.div>
  );
}
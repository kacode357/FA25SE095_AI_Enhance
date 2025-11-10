// app/student/courses/[id]/reports/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  ListChecks,
  Loader2,
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import { useGetMyReports } from "@/hooks/reports/useGetMyReports";
import CreateReportButton from "../assignments/components/createReportButton";

// ===== helpers =====
const dt = (s?: string | null) => {
  if (!s) return "";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleString("en-GB");
};

type UIReportItem = {
  id: string;
  title: string;
  status: number | string;
  createdAt: string | null;
  updatedAt: string | null;
  grade: number | null;
};

export default function ReportsListPage() {
  const params = useParams();
  const router = useRouter();
  const sp = useSearchParams();

  const courseId = typeof params?.id === "string" ? params.id : "";
  const assignmentId = sp.get("assignmentId") || "";

  // ✅ dùng hook mới
  const { getMyReports, loading } = useGetMyReports();

  const [items, setItems] = useState<UIReportItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const didFetchRef = useRef(false);

  // Fetch once theo assignmentId
  useEffect(() => {
    (async () => {
      if (!assignmentId || didFetchRef.current) return;
      didFetchRef.current = true;
      try {
        // Nếu BE hỗ trợ filter theo assignmentId thì truyền vào, còn không vẫn ok
        const res = await getMyReports({ assignmentId });
        // Shape chính thức: { success, message, reports: ReportListItem[] }
        const list = res?.reports ?? [];

        // Map về UI item. Tên hiển thị ưu tiên assignmentTitle.
        const mapped: UIReportItem[] = list
          .filter((r) => !!r) // guard
          .filter((r) => !assignmentId || r.assignmentId === assignmentId) // phòng khi BE chưa filter
          .map((r) => ({
            id: r.id,
            title: r.assignmentTitle || `Report ${String(r.id).slice(0, 8)}`,
            status: r.status,
            createdAt: r.createdAt ?? null,
            updatedAt: r.updatedAt ?? r.submittedAt ?? null,
            grade: r.grade ?? null,
          }));

        setItems(mapped);
      } catch (e: any) {
        setError(e?.message || "Failed to load reports");
      }
    })();
  }, [assignmentId, getMyReports]);

  const headerSubtitle = useMemo(() => {
    if (!items?.length) return "You have no reports yet for this assignment.";
    return `You have ${items.length} ${items.length > 1 ? "reports" : "report"} for this assignment.`;
  }, [items]);

  if (!assignmentId) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <AlertTriangle className="w-7 h-7 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-nav mb-2">Missing assignmentId</h2>
          <p className="text-sm text-foreground/70">
            Add <code>?assignmentId=...</code> to the URL to view your reports.
          </p>
          <div className="mt-6">
            <button
              onClick={() => router.push(`/student/courses/${courseId}`)}
              className="btn bg-white border border-brand text-nav hover:text-nav-active"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col gap-6 py-6 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* ===== Header ===== */}
      <div className="flex flex-col gap-3">
        {/* Row 1: Title + Back (Back ngang hàng Title) */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold text-nav flex items-center gap-2 truncate">
              <ListChecks className="w-7 h-7 text-nav-active shrink-0" />
              <span className="truncate">My Reports</span>
            </h1>
            <p className="mt-1 text-sm text-foreground/70">{headerSubtitle}</p>
          </div>

          <div className="shrink-0 self-start">
            <button
              onClick={() =>
                router.push(`/student/courses/${courseId}/assignments/${assignmentId}`)
              }
              className="btn bg-white border border-brand text-nav hover:text-nav-active"
              title="Back to Assignment"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        </div>

        {/* Row 2: Actions ở dòng riêng */}
        <div className="w-full flex justify-end">
          <div className="flex flex-row flex-wrap items-center gap-2">
            <CreateReportButton
              courseId={courseId}
              assignmentId={assignmentId}
              isGroupSubmission={false}
              label="Create Report"
              className="btn btn-gradient px-5 py-2"
            />
          </div>
        </div>
      </div>
      {/* ===== /Header ===== */}

      {/* ===== Content ===== */}
      <div className="card rounded-2xl p-4">
        {loading && (
          <div className="flex items-center justify-center h-48 text-nav">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Loading reports…
          </div>
        )}

        {!loading && error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="text-sm text-foreground/70">
            You don’t have any report yet. Click <b>Create Report</b> to start a new one.
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <ul className="divide-y divide-[var(--border)]">
            {items.map((r) => {
              const reportId = r.id;
              const title = r.title;
              const status = r.status; // number (theo BE). Nếu muốn text map ở client thì làm thêm map.
              const created = r.createdAt;
              const updated = r.updatedAt;
              const grade = r.grade;

              return (
                <li key={reportId} className="py-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-nav-active shrink-0" />
                        <button
                          className="text-foreground font-medium hover:text-nav-active truncate text-left"
                          onClick={() =>
                            router.push(
                              `/student/courses/${courseId}/reports/${reportId}`
                            )
                          }
                          title="Open report"
                        >
                          {title}
                        </button>
                      </div>

                      <div className="mt-1 text-xs text-foreground/70 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <b>Status:</b>&nbsp;{String(status)}
                        </span>
                        {typeof grade === "number" && (
                          <span className="inline-flex items-center gap-1">
                            <ListChecks className="w-3 h-3" />
                            <b>Score:</b>&nbsp;{grade}
                          </span>
                        )}
                        {created && (
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            <b>Created:</b>&nbsp;{dt(created)}
                          </span>
                        )}
                        {updated && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <b>Updated:</b>&nbsp;{dt(updated)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        className="btn bg-white border border-brand text-nav hover:text-nav-active"
                        onClick={() =>
                          router.push(
                            `/student/courses/${courseId}/reports/${reportId}`
                          )
                        }
                      >
                        <FileText className="w-4 h-4" />
                        View
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {/* ===== /Content ===== */}
    </motion.div>
  );
}

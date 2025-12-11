"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FilePlus2,
  RefreshCw,
  Loader2,
  FileText,
  CalendarDays,
  Clock,
  AlertCircle,
} from "lucide-react";

import { useGetMyReports } from "@/hooks/reports/useGetMyReports";
import type { ReportListItem } from "@/types/reports/reports.response";

const dt = (s?: string | null) => {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString("en-GB"); // DD/MM/YYYY, HH:mm:ss
};

const headerButtonClass = "btn bg-white border border-brand text-nav hover:text-nav-active";

export default function ReportsCreatePage() {
  const params = useParams();
  const router = useRouter();
  const sp = useSearchParams();

  const courseId = typeof params?.id === "string" ? params.id : "";
  const assignmentId = sp.get("assignmentId") || undefined;

  const { getMyReports, loading } = useGetMyReports();

  const [items, setItems] = useState<ReportListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const pageTitle = useMemo(() => {
    if (assignmentId) return "Create / Continue Report";
    return "Your Reports";
  }, [assignmentId]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setError(null);
      try {
        const res = await getMyReports(
          assignmentId
            ? 
              { assignmentId, page: 1, pageSize: 20 }
            : { page: 1, pageSize: 20 } as any
        );
        if (!mounted) return;
        if (!res?.success) {
          setError(res?.message || "Failed to load reports");
          setItems([]);
          return;
        }
        setItems(res.reports || []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load reports");
        setItems([]);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId]);

  const handleBack = () => {
    router.push(`/student/courses/${courseId}`);
  };

  const handleOpenReport = (reportId: string) => {
    router.push(`/student/courses/${courseId}/reports/${reportId}`);
  };

  const handleReload = () => {
    router.refresh();
  };

  const filtered = useMemo(() => {
    if (!assignmentId) return items;
    return items.filter((x) => x.assignmentId === assignmentId);
  }, [items, assignmentId]);

  const existsDraftForAssignment = useMemo(() => {
    if (!assignmentId) return false;
    return filtered.some((x) => x.status === 1 /* Draft */);
  }, [filtered, assignmentId]);

  return (
    <motion.div
      className="flex flex-col gap-6 py-6 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-nav flex items-center gap-2">
            <FilePlus2 className="w-7 h-7 text-nav-active shrink-0" />
            <span className="truncate">{pageTitle}</span>
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {assignmentId
              ? "Find your existing report for this assignment or start fresh."
              : "Browse your existing reports."}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <button
            onClick={handleBack}
            className={headerButtonClass}
            title="Back to Course"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>

      {assignmentId && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
          Filtering by <b>assignmentId</b>: <code className="text-[11px]">{assignmentId}</code>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {loading && !items.length ? (
        <div className="flex items-center justify-center h-[40vh] text-nav">
          <Loader2 className="w-6 h-6 mr-2 animate-spin text-nav-active" />
          <span className="text-sm">Loading your reports…</span>
        </div>
      ) : null}

      {!loading && filtered.length === 0 && !error && (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-600">
          <p className="text-sm">No reports found{assignmentId ? " for this assignment" : ""}.</p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="card rounded-2xl p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleOpenReport(r.id)}
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0">
                  <FileText className="w-6 h-6 text-nav-active" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-nav truncate">{r.assignmentTitle}</div>
                  <div className="mt-1 text-xs text-slate-600 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {dt(r.createdAt)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {r.submittedAt ? `Submitted: ${dt(r.submittedAt)}` : "Draft"}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-700">
                    {r.groupName ? `Group: ${r.groupName}` : "Individual"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {assignmentId && existsDraftForAssignment && (
        <div className="text-xs text-slate-600">
          You already have a draft for this assignment. Click the card above to continue.
        </div>
      )}
    </motion.div>
  );
}

// app/student/courses/[id]/reports/submit/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Clock,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { useAssignmentReports } from "@/hooks/reports/useAssignmentReports";
import type { ReportListItem } from "@/types/reports/reports.response";
import { ReportStatus } from "@/types/reports/reports.response";

import ReportFileAttachment from "./components/ReportFileAttachment";
import SubmitDraftButton from "./components/SubmitDraftButton";

const dt = (s?: string | null) => {
  if (!s) return "";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleString("en-GB");
};

const statusLabel = (s: number) => {
  switch (s) {
    case ReportStatus.Draft:
      return "Draft";
    case ReportStatus.Submitted:
      return "Submitted";
    case ReportStatus.UnderReview:
      return "Under review";
    case ReportStatus.RequiresRevision:
      return "Requires revision";
    case ReportStatus.Resubmitted:
      return "Resubmitted";
    case ReportStatus.Graded:
      return "Graded";
    case ReportStatus.Late:
      return "Late";
    case ReportStatus.Rejected:
      return "Rejected";
    default:
      return `Unknown (${s})`;
  }
};

const statusBadgeClass = (s: number) => {
  switch (s) {
    case ReportStatus.Draft:
      return "bg-slate-100 text-slate-700 border border-slate-200";
    case ReportStatus.Submitted:
    case ReportStatus.UnderReview:
      return "bg-blue-50 text-blue-700 border border-blue-200";
    case ReportStatus.RequiresRevision:
      return "bg-amber-50 text-amber-700 border border-amber-200";
    case ReportStatus.Resubmitted:
      return "bg-indigo-50 text-indigo-700 border border-indigo-200";
    case ReportStatus.Graded:
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case ReportStatus.Late:
      return "bg-rose-50 text-rose-700 border border-rose-200";
    case ReportStatus.Rejected:
      return "bg-red-50 text-red-700 border border-red-200";
    default:
      return "bg-slate-50 text-slate-700 border border-slate-200";
  }
};

export default function SubmitReportsPage() {
  const params = useParams();
  const router = useRouter();
  const sp = useSearchParams();

  const courseId = typeof params?.id === "string" ? params.id : "";
  const assignmentId = sp.get("assignmentId") || "";

  const { fetchAssignmentReports, loading } = useAssignmentReports();

  const [items, setItems] = useState<ReportListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    if (!assignmentId) return;

    (async () => {
      try {
        const res = await fetchAssignmentReports({
          assignmentId,
        });
        if (!res?.success) {
          setError(res?.message || "Failed to load reports");
          return;
        }
        setItems(res.reports || []);
        setError(null);
      } catch (e: any) {
        setError(e?.message || "Failed to load reports");
      }
    })();
  }, [assignmentId, fetchAssignmentReports, refreshToken]);

  const refresh = () => setRefreshToken((x) => x + 1);

  const assignmentTitle = useMemo(
    () => items[0]?.assignmentTitle || "",
    [items]
  );

  const hasDraft = items.some((r) => r.status === ReportStatus.Draft);

  if (!assignmentId) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <AlertTriangle className="w-7 h-7 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-nav mb-2">
            Missing assignmentId
          </h2>
          <p className="text-sm text-foreground/70">
            Add <code>?assignmentId=...</code> to the URL to submit your
            report.
          </p>
          <div className="mt-6">
            <Button
              onClick={() => router.push(`/student/courses/${courseId}`)}
              variant="outline"
              className="bg-white border border-brand text-nav hover:text-nav-active"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Course
            </Button>
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
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-nav flex items-center gap-2 truncate">
            <FileText className="w-7 h-7 text-nav-active shrink-0" />
            <span className="truncate">Submit Report</span>
          </h1>
          <p className="mt-1 text-sm text-foreground/70">
            Attach your report file and submit the draft for this assignment.
          </p>
          {assignmentTitle && (
            <p className="mt-1 text-xs text-foreground/60">
              Assignment:&nbsp;
              <span className="font-semibold">{assignmentTitle}</span>
            </p>
          )}
        </div>

        <div className="shrink-0 flex flex-col gap-2 items-end">
          <Button
            onClick={() =>
              router.push(
                `/student/courses/${courseId}/assignments/${assignmentId}`
              )
            }
            variant="outline"
            className="bg-white border border-brand text-nav hover:text-nav-active"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Assignment
          </Button>
        </div>
      </div>

      {/* Content */}
      <Card className="card rounded-2xl">
        <CardContent className="p-4 space-y-4">
          {loading && (
            <div className="text-sm text-foreground/70">
              Loading reports...
            </div>
          )}

          {!loading && error && (
            <div className="text-sm text-red-600">{error}</div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="text-sm text-foreground/70">
              You don't have any report for this assignment yet. Create a
              report first, then come back here to submit it.
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="space-y-3">
              {!hasDraft && (
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                  No report in <b>Draft</b> status. Only draft reports can be
                  submitted with this page.
                </div>
              )}

              <ul className="space-y-3">
                {items.map((r) => (
                  <li
                    key={r.id}
                    className="border border-[var(--border)] rounded-xl px-3 py-3 flex flex-col gap-2"
                  >
                    {/* top row: title + status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-nav truncate">
                            {r.assignmentTitle || "Report"}
                          </span>
                        </div>
                        <div className="mt-1 text-[11px] text-foreground/70 flex flex-wrap gap-x-3 gap-y-1">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            Created: {dt(r.createdAt)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Updated: {dt(r.updatedAt)}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full ${statusBadgeClass(
                            r.status
                          )}`}
                        >
                          {statusLabel(r.status)}
                        </span>
                        {typeof r.grade === "number" && (
                          <span className="text-[11px] text-emerald-700">
                            Grade: <b>{r.grade}</b>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* middle row: file attachment */}
                    <div className="mt-1">
                      <ReportFileAttachment
                        reportId={r.id}
                        fileUrl={r.fileUrl}
                        disabled={r.status !== ReportStatus.Draft}
                        onChanged={() => refresh()}
                      />
                    </div>

                    {/* bottom row: actions */}
                    <div className="flex justify-end">
                      <SubmitDraftButton
                        reportId={r.id}
                        status={r.status}
                        onSubmitted={() => refresh()}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

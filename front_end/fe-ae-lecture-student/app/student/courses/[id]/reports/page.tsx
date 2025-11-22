// app/student/courses/[id]/reports/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Loader2,
  CalendarDays,
  Clock,
  AlertTriangle,
  Users,
  MessageCircle,
  Layers,
  Star,
  CheckCircle2,
} from "lucide-react";

import { useGetMyReports } from "@/hooks/reports/useGetMyReports";
import CreateReportButton from "../assignments/components/createReportButton";

// shadcn
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// types BE
import type { ReportListItem } from "@/types/reports/reports.response";

// helpers status (chung)
import { getReportStatusMeta } from "./components/report-labels";

// ===== helpers =====
const dt = (s?: string | null) => {
  if (!s) return "";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleString("en-GB");
};

// Reuse type từ BE – không tạo UIReportItem riêng nữa
type UIReportItem = ReportListItem;

// Reusable Group pill (dùng trong card)
function GroupPill({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
      <Users className="w-3 h-3" />
      Group: {name}
    </span>
  );
}

export default function ReportsListPage() {
  const params = useParams();
  const router = useRouter();
  const sp = useSearchParams();

  const courseId = typeof params?.id === "string" ? params.id : "";
  const assignmentId = sp.get("assignmentId") || "";
  // ✅ Lấy groupId từ URL
  const groupIdFromQuery = sp.get("groupId") || "";

  const { getMyReports, loading: reportsLoading } = useGetMyReports();

  const [items, setItems] = useState<UIReportItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch reports theo courseId + assignmentId
  useEffect(() => {
    if (!assignmentId || !courseId) return;

    setError(null);
    setItems([]);

    (async () => {
      try {
        const res = await getMyReports({
          courseId,
          assignmentId,
        });

        const list = (res?.reports ?? []) as UIReportItem[];
        setItems(list);
      } catch (e: any) {
        setError(e?.message || "Failed to load reports");
      }
    })();
    // ❌ không đưa getMyReports vào deps để tránh loop
  }, [courseId, assignmentId]);

  const report = items[0] ?? null;

  const headerSubtitle = useMemo(() => {
    if (!report) return "You have no report yet for this assignment.";
    return "You have 1 report for this assignment.";
  }, [report]);

  if (!assignmentId) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <AlertTriangle className="w-7 h-7 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-nav mb-2">
            Missing assignmentId
          </h2>
          <p className="text-sm text-foreground/70">
            Add <code>?assignmentId=...</code> to the URL to view your report.
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

  const showLoading = reportsLoading;

  const statusMeta = report
    ? getReportStatusMeta(report.status)
    : { label: "", className: "badge-report" };

  const assignmentTitleForCreate = report?.assignmentTitle;

  // ✅ Fix: nếu chưa có report mà URL có groupId ⇒ coi là group submission
  const isGroupSubmissionForCreate =
    report?.isGroupSubmission ?? Boolean(groupIdFromQuery);

  // ✅ Ưu tiên groupId từ report, fallback groupId trên URL
  const resolvedGroupId =
    (report?.groupId && report.groupId.trim()) ||
    (groupIdFromQuery && groupIdFromQuery.trim()) ||
    undefined;

  return (
    <motion.div
      className="flex flex-col gap-6 py-6 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* ===== Header ===== */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-foreground/60 mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span>Report overview</span>
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-nav truncate">
              {report?.assignmentTitle || "My Report"}
            </h1>
            <p className="mt-1 text-sm text-foreground/70">{headerSubtitle}</p>
          </div>

          <div className="flex flex-row items-start gap-2 self-start md:self-center">
            <Button
              onClick={() =>
                router.push(
                  `/student/courses/${courseId}/assignments/${assignmentId}`
                )
              }
              variant="outline"
              className="bg-white border border-brand text-nav hover:text-nav-active"
              title="Back to Assignment"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex justify-end">
          <div className="flex flex-row flex-wrap items-center gap-2">
            <CreateReportButton
              courseId={courseId}
              assignmentId={assignmentId}
              assignmentTitle={assignmentTitleForCreate}
              isGroupSubmission={isGroupSubmissionForCreate}
              label={report ? "Create / Update report" : "Create report"}
              className="btn btn-gradient px-5 py-2"
              {...(resolvedGroupId ? { groupId: resolvedGroupId } : {})}
            />
          </div>
        </div>
      </div>

      {/* ===== Content ===== */}
      <Card className="card rounded-2xl border border-[var(--border-soft)] shadow-sm">
        <CardHeader className="border-b border-[var(--border-soft)] pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-nav-active" />
              <div>
                <p className="text-sm font-semibold text-nav">
                  Report details
                </p>
                {report?.version && (
                  <p className="text-xs text-foreground/60 flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    Version {report.version}
                  </p>
                )}
              </div>
            </div>

            {/* Status badge & Score nằm TRONG card */}
            <div className="flex items-center gap-2">
              {report && (
                <span className={statusMeta.className}>
                  {statusMeta.label}
                </span>
              )}
              {typeof report?.grade === "number" && (
                <div className="flex items-center gap-1 text-sm font-semibold text-amber-600">
                  <Star className="w-4 h-4" />
                  Score: {report.grade}
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-4">
          {showLoading && (
            <div className="flex items-center justify-center h-40 text-nav">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Loading report…
            </div>
          )}

          {!showLoading && error && (
            <div className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {!showLoading && !error && !report && (
            <div className="rounded-md border border-dashed border-[var(--border-soft)] bg-[var(--background-soft)] px-4 py-6 text-sm text-foreground/70 text-center">
              You don’t have a report for this assignment yet. Click{" "}
              <b>Create report</b> above to start.
            </div>
          )}

          {!showLoading && !error && report && (
            <>
              {/* Meta grid – có Status + Group TRONG card */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm">
                {/* Status */}
                <div className="flex flex-col gap-1">
                  <span className="text-foreground/60">Status</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span className={statusMeta.className}>
                      {statusMeta.label}
                    </span>
                  </div>
                </div>

                {/* Group (nếu có) */}
                {report.groupName && (
                  <div className="flex flex-col gap-1">
                    <span className="text-foreground/60">Group</span>
                    <div className="flex items-center gap-2">
                      <GroupPill name={report.groupName} />
                    </div>
                  </div>
                )}

                {/* Version */}
                {report.version && (
                  <div className="flex flex-col gap-1">
                    <span className="text-foreground/60">Version</span>
                    <div className="flex items-center gap-2">
                      <Layers className="w-3 h-3" />
                      <span className="font-medium">v{report.version}</span>
                    </div>
                  </div>
                )}

                {/* Created */}
                {report.createdAt && (
                  <div className="flex flex-col gap-1">
                    <span className="text-foreground/60">Created at</span>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-3 h-3" />
                      <span>{dt(report.createdAt)}</span>
                    </div>
                  </div>
                )}

                {/* Submitted */}
                {report.submittedAt && (
                  <div className="flex flex-col gap-1">
                    <span className="text-foreground/60">Submitted at</span>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>{dt(report.submittedAt)}</span>
                    </div>
                  </div>
                )}

                {/* Updated */}
                {report.updatedAt && (
                  <div className="flex flex-col gap-1">
                    <span className="text-foreground/60">Last updated</span>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>{dt(report.updatedAt)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Feedback */}
              {report.feedback && (
                <div className="mt-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs sm:text-sm text-amber-900 flex flex-col gap-2">
                  <div className="flex items-center gap-2 font-medium">
                    <MessageCircle className="w-4 h-4" />
                    Instructor feedback
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {report.feedback}
                  </p>
                </div>
              )}

              {/* Actions under card */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-foreground/60">
                  Click <b>Open report</b> to continue editing or review your
                  submission.
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="bg-white border border-[var(--border-soft)] text-foreground hover:text-nav-active"
                    onClick={() =>
                      router.push(
                        `/student/courses/${courseId}/reports/${report.id}`
                      )
                    }
                  >
                    <FileText className="w-4 h-4" />
                    Open report
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

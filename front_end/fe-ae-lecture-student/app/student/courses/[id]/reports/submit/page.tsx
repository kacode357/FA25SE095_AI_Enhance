// app/student/courses/[id]/reports/submit/page.tsx (hoặc tương đương)
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
  Eye,
  Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { useAssignmentReports } from "@/hooks/reports/useAssignmentReports";
import type { ReportListItem } from "@/types/reports/reports.response";
import { ReportStatus } from "@/types/reports/reports.response";
import { formatDateTimeVN } from "@/utils/datetime/format-datetime";

import ReportFileAttachment from "./components/ReportFileAttachment";
import SubmitDraftButton from "./components/SubmitDraftButton";

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
      return "badge-report badge-report--draft";
    case ReportStatus.Submitted:
      return "badge-report badge-report--submitted";
    case ReportStatus.UnderReview:
      return "badge-report badge-report--under-review";
    case ReportStatus.RequiresRevision:
      return "badge-report badge-report--requires-revision";
    case ReportStatus.Resubmitted:
      return "badge-report badge-report--resubmitted";
    case ReportStatus.Graded:
      return "badge-report badge-report--graded";
    case ReportStatus.Late:
      return "badge-report badge-report--late";
    case ReportStatus.Rejected:
      return "badge-report badge-report--rejected";
    default:
      return "badge-report badge-report--draft";
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

  // map reportId -> File (selected but not uploaded yet)
  const [pendingFiles, setPendingFiles] = useState<Record<string, File | null>>(
    {}
  );

  useEffect(() => {
    if (!assignmentId) return;

    (async () => {
      try {
        const res = await fetchAssignmentReports({ assignmentId });
        if (!res?.success) {
          setError(res?.message || "Failed to load reports.");
          return;
        }
        setItems(res.reports || []);
        setError(null);
      } catch (e: any) {
        setError(e?.message || "Failed to load reports.");
      }
    })();
    // ❗ Không đưa fetchAssignmentReports vào deps để tránh loop
  }, [assignmentId, refreshToken]);

  const refresh = () => setRefreshToken((x) => x + 1);

  const assignmentTitle = useMemo(
    () => items[0]?.assignmentTitle || "",
    [items]
  );

  if (!assignmentId) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <AlertTriangle className="w-7 h-7 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-nav mb-2">
            Assignment not specified
          </h2>
          <p className="text-sm text-foreground/70">
            This page requires an{" "}
            <code className="px-1 py-0.5 rounded bg-slate-100 text-xs">
              assignmentId
            </code>{" "}
            query parameter. Please open this page from an assignment or add{" "}
            <code className="px-1 py-0.5 rounded bg-slate-100 text-xs">
              ?assignmentId=...
            </code>{" "}
            to the URL.
          </p>
          <div className="mt-6">
            <Button
              onClick={() => router.push(`/student/courses/${courseId}`)}
              variant="outline"
              className="bg-white border border-brand text-nav hover:text-nav-active"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to course
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-nav flex items-center gap-2 truncate">
            <FileText className="w-7 h-7 text-nav-active shrink-0" />
            <span className="truncate">Submit report</span>
          </h1>
          <p className="mt-1 text-sm text-foreground/70">
            Upload your report file and submit your draft when you&apos;re ready
            for review.
          </p>
          {assignmentTitle && (
            <p className="mt-1 text-xs text-foreground/60">
              Assignment:&nbsp;
              <span className="font-semibold text-nav">{assignmentTitle}</span>
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
            Back to assignment
          </Button>
        </div>
      </div>

      {/* Main content layout: 7 / 3 */}
      <div className="grid gap-4 lg:gap-6 lg:grid-cols-[minmax(0,2.3fr)_minmax(0,1fr)]">
        {/* Left: reports list */}
        <Card className="card rounded-2xl">
          <CardContent className="p-4 sm:p-6 space-y-4">
            {loading && (
              <div className="text-sm text-foreground/70">
                Loading reports...
              </div>
            )}

            {!loading && error && (
              <div className="text-sm text-red-600">
                {error || "Failed to load reports."}
              </div>
            )}

            {!loading && !error && items.length === 0 && (
              <div className="text-sm text-foreground/70">
                You don&apos;t have any reports for this assignment yet. Create
                a report from the assignment page first, then come back here to
                upload and submit it.
              </div>
            )}

            {!loading && !error && items.length > 0 && (
              <div className="space-y-3">
                <ul className="space-y-3">
                  {items.map((r) => {
                    const canEdit =
                      r.status === ReportStatus.Draft ||
                      r.status === ReportStatus.RequiresRevision;
                    const isSubmittedFinal =
                      r.status === ReportStatus.Submitted ||
                      r.status === ReportStatus.UnderReview ||
                      r.status === ReportStatus.Resubmitted ||
                      r.status === ReportStatus.Graded ||
                      r.status === ReportStatus.Late ||
                      r.status === ReportStatus.Rejected;

                    const pendingFile = pendingFiles[r.id] || null;

                    // ✅ submission text: dùng data thật, không hard-code ""
                    const fileName =
                      pendingFile?.name ||
                      (r.fileUrl ? r.fileUrl.split("/").pop() ?? "" : "");
                    const submissionText = fileName
                      ? `File: ${fileName}`
                      : "No file attached";

                    return (
                      <li
                        key={r.id}
                        className={`report-submit-card px-3 py-3 sm:px-4 sm:py-4 flex flex-col gap-3 ${
                          isSubmittedFinal ? "report-submit-card--submitted" : ""
                        }`}
                      >
                        {/* Top: title + meta + status */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <div className="min-w-0">
                                <p className="font-medium text-sm text-nav truncate">
                                  {r.assignmentTitle || "Report"}
                                </p>
                                <p className="text-[11px] text-foreground/60 truncate">
                                  {canEdit
                                    ? "You can still change the file and submit this report."
                                    : isSubmittedFinal
                                    ? "This report has been submitted. You can only view it."
                                    : "This report has already been processed."}
                                </p>
                              </div>
                            </div>

                            <div className="mt-2 text-[11px] text-foreground/70 flex flex-wrap gap-x-4 gap-y-1">
                              <span className="inline-flex items-center gap-1">
                                <CalendarDays className="w-3 h-3" />
                                Created: {formatDateTimeVN(r.createdAt)}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Updated: {formatDateTimeVN(r.updatedAt)}
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
                            {isSubmittedFinal && (
                              <span className="report-submit-note text-[10px] mt-0.5">
                                You have submitted this report.
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Middle: file attachment */}
                        <div className="mt-1">
                          <ReportFileAttachment
                            reportId={r.id}
                            fileUrl={r.fileUrl}
                            disabled={!canEdit}
                            pendingFileName={pendingFile?.name ?? null}
                            onFileSelected={(file) => {
                              setPendingFiles((prev) => ({
                                ...prev,
                                [r.id]: file,
                              }));
                            }}
                          />
                        </div>

                        {/* Bottom: actions */}
                        <div className="pt-2 report-submit-divider">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="border-brand/60 text-nav hover:text-nav-active hover:border-brand px-3 py-1.5 rounded-xl text-xs sm:text-sm"
                              onClick={() =>
                                router.push(
                                  `/student/courses/${courseId}/reports/${r.id}?refresh=${Date.now()}`
                                )
                              }
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View report
                            </Button>

                            {canEdit && (
                              <SubmitDraftButton
                                reportId={r.id}
                                status={r.status}
                                fileUrl={r.fileUrl}
                                pendingFile={pendingFile}
                                // ✅ truyền submission là thông tin file thật, không hard-code ""
                                submission={submissionText}
                                onSubmitted={() => {
                                  // clear pending file + reload data
                                  setPendingFiles((prev) => ({
                                    ...prev,
                                    [r.id]: null,
                                  }));
                                  refresh();
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: upload rules (separated column) */}
        <div className="lg:self-start">
          <Card className="rounded-2xl border-dashed border-slate-200 bg-slate-50/60">
            <CardContent className="p-4 sm:p-5 space-y-3">
              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  <Info className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-nav">
                    File upload rules
                  </h3>
                  <p className="text-xs text-foreground/70 mt-1">
                    These rules are enforced by the report service. If any rule
                    is violated, the upload will be rejected.
                  </p>
                </div>
              </div>

              <ul className="text-xs text-foreground/80 space-y-1.5 list-disc list-inside">
                <li>
                  <span className="font-medium">Status restriction:</span>{" "}
                  uploads are only allowed when the report status is{" "}
                  <b>Draft</b> or <b>Requires revision</b>.
                </li>
                <li>
                  <span className="font-medium">Ownership:</span> only the
                  report owner or group members can upload files.
                </li>
                <li>
                  <span className="font-medium">File types:</span> allowed
                  extensions are <b>PDF, DOC, DOCX, TXT, ZIP, RAR</b>.
                </li>
                <li>
                  <span className="font-medium">File size:</span> maximum{" "}
                  <b>10MB</b> per file.
                </li>
                <li>
                  <span className="font-medium">Versioning:</span> old files are
                  preserved in history when a new file is uploaded.
                </li>
                <li>
                  <span className="font-medium">Tracking:</span> all file
                  changes are recorded in <b>ReportHistory</b> for audit trail.
                </li>
              </ul>

              <p className="text-[11px] text-foreground/70 border-t border-slate-200/60 pt-2">
                Workflow: select a file with{" "}
                <span className="font-medium">Upload file / Change file</span>,
                then click <span className="font-medium">Submit draft</span>.
                The system will upload the latest selected file (if any) and
                submit the draft in one action.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

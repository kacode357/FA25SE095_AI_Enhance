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
import { useAssignmentById } from "@/hooks/assignment/useAssignmentById";

// shadcn
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

  const { getMyReports, loading } = useGetMyReports();

  // 🔹 assignment detail để lấy isGroupAssignment + assignedGroups
  const {
    data: assignmentData,
    loading: assignmentLoading,
    fetchAssignment,
  } = useAssignmentById();

  const [items, setItems] = useState<UIReportItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const didFetchReportsRef = useRef(false);
  const didFetchAssignmentRef = useRef(false);

  // Fetch reports theo assignmentId
  useEffect(() => {
    (async () => {
      if (!assignmentId || didFetchReportsRef.current) return;
      didFetchReportsRef.current = true;
      try {
        const res = await getMyReports({ assignmentId });
        const list = res?.reports ?? [];

        const mapped: UIReportItem[] = list
          .filter((r) => !!r)
          .filter((r) => !assignmentId || r.assignmentId === assignmentId)
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

  // 🔹 Fetch assignment detail để biết group info
  useEffect(() => {
    if (!assignmentId || didFetchAssignmentRef.current) return;
    didFetchAssignmentRef.current = true;
    fetchAssignment(assignmentId);
  }, [assignmentId, fetchAssignment]);

  const assignment = assignmentData?.assignment;
  const isGroupAssignment = !!assignment?.isGroupAssignment;

  // 🔹 groupId cho CreateReportButton:
  // tạm thời lấy group đầu tiên được assign cho assignment
  const groupIdForCreateReport =
    isGroupAssignment && Array.isArray(assignment?.assignedGroups)
      ? assignment!.assignedGroups![0]?.id ?? null
      : null;

  const headerSubtitle = useMemo(() => {
    if (!items?.length)
      return "You have no reports yet for this assignment.";
    return `You have ${items.length} ${
      items.length > 1 ? "reports" : "report"
    } for this assignment.`;
  }, [items]);

  if (!assignmentId) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <AlertTriangle className="w-7 h-7 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-nav mb-2">
            Missing assignmentId
          </h2>
          <p className="text-sm text-foreground/70">
            Add <code>?assignmentId=...</code> to the URL to view your reports.
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

  const showLoading =
    loading || assignmentLoading; // gộp loading của reports + assignment

  return (
    <motion.div
      className="flex flex-col gap-6 py-6 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* ===== Header ===== */}
      <div className="flex flex-col gap-3">
        {/* Row 1: Title + Back */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold text-nav flex items-center gap-2 truncate">
              <ListChecks className="w-7 h-7 text-nav-active shrink-0" />
              <span className="truncate">My Reports</span>
            </h1>
            <p className="mt-1 text-sm text-foreground/70">{headerSubtitle}</p>
            {assignment && (
              <p className="mt-1 text-xs text-foreground/60">
                Assignment:&nbsp;
                <span className="font-semibold">{assignment.title}</span>
                {isGroupAssignment && (
                  <span className="ml-2 inline-flex items-center text-[11px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Group assignment
                  </span>
                )}
              </p>
            )}
          </div>

          <div className="shrink-0 self-start">
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

        {/* Row 2: Actions */}
        <div className="w-full flex justify-end">
          <div className="flex flex-row flex-wrap items-center gap-2">
            <CreateReportButton
              courseId={courseId}
              assignmentId={assignmentId}
              assignmentTitle={assignment?.title}
              groupId={groupIdForCreateReport}
              isGroupSubmission={isGroupAssignment}
              label="Create Report"
              className="btn btn-gradient px-5 py-2"
            />
          </div>
        </div>
      </div>

      {/* ===== Content ===== */}
      <Card className="card rounded-2xl">
        <CardContent className="p-4">
          {showLoading && (
            <div className="flex items-center justify-center h-48 text-nav">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Loading reports…
            </div>
          )}

          {!showLoading && error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          {!showLoading && !error && items.length === 0 && (
            <div className="text-sm text-foreground/70">
              You don’t have any report yet. Click <b>Create Report</b> to
              start a new one.
            </div>
          )}

          {!showLoading && !error && items.length > 0 && (
            <ul className="divide-y divide-[var(--border)]">
              {items.map((r) => {
                const reportId = r.id;
                const title = r.title;
                const status = r.status;
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
                        <Button
                          className="bg-white border border-brand text-nav hover:text-nav-active"
                          variant="outline"
                          onClick={() =>
                            router.push(
                              `/student/courses/${courseId}/reports/${reportId}`
                            )
                          }
                        >
                          <FileText className="w-4 h-4" />
                          View
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";
import {
  BookOpenCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  FileText
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useStudentCourseGrades } from "@/hooks/assignment/useStudentCourseGrades";
import type {
  StudentAssignmentGradeItem,
  StudentCourseGradeStatistics,
} from "@/types/assignments/assignment.response";
import { CourseMiniHeader } from "../components/CourseMiniHeader";
import { formatDateTimeVN } from "@/utils/datetime/format-datetime";

// Use the exact type returned by the API for assignmentGrades
type Row = StudentAssignmentGradeItem;

// Badge: display the assignment percentage
function GradeBadge({ percentage }: { percentage: number | null | undefined }) {
  if (
    percentage === null ||
    percentage === undefined ||
    Number.isNaN(Number(percentage))
  ) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-[11px] rounded-md border border-[var(--border)] text-[var(--text-muted)]">
        —
      </span>
    );
  }

  const p = Math.round(Number(percentage));

  return (
    <span className="inline-flex items-center px-2 py-0.5 text-[11px] rounded-md border border-[var(--border)] text-[var(--text-muted)]">
      {p}%
    </span>
  );
}

// Pill: just style the status string, do not change meaning
function StatusPill({ status }: { status: string }) {
  if (status === "Graded") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CircleCheck className="w-3 h-3" /> Graded
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
      <FileText className="w-3 h-3" /> {status || "N/A"}
    </span>
  );
}

export default function GradesPage() {
  const { id } = useParams();
  const router = useRouter();
  const courseId = typeof id === "string" ? id : "";

  const { getStudentCourseGrades, loading } = useStudentCourseGrades();

  const [rows, setRows] = useState<Row[]>([]);
  const [stats, setStats] = useState<StudentCourseGradeStatistics | null>(null);

  const [page, setPage] = useState(1);
  const pageSize = 6;

  // Avoid multiple calls on initial mount (React StrictMode)
  const didFetchRef = useRef(false);

  useEffect(() => {
    if (!courseId) return;
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    let cancelled = false;

    (async () => {
      const res = await getStudentCourseGrades(courseId);
      if (!res || !res.success || cancelled) return;

      const s = res.statistics;
      setStats(s);
      setRows(s.assignmentGrades);
      setPage(1);
    })();

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

  // Summary numbers
  const completedCount = stats?.completedAssignmentsCount ?? 0;
  // const totalWeightCovered = stats?.totalWeightCovered ?? 0;
  // const totalWeightedScore = stats?.totalWeightedScore ?? 0;

  // Overall percentage based on current graded work
  // const overallPercent =
  //   stats && totalWeightCovered > 0
  //     ? Math.round((stats.totalWeightedScore / totalWeightCovered) * 100)
  //     : 0;

  return (
    <motion.div
      className="flex flex-col gap-6 py-6 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <CourseMiniHeader section="Grades" />

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-0">
        {/* Overall grade so far */}
        {/* <div className="card rounded-2xl p-4">
          <div className="text-sm font-semibold text-[var(--text-muted)] flex items-center gap-2">
            <Percent className="w-4 h-4 text-brand" />
            Current overall grade
          </div>
          <div className="mt-2 text-3xl font-bold text-foreground">
            {loading && !stats ? "…" : `${overallPercent}%`}
          </div>
          <div className="mt-2 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${overallPercent}%`,
                background: "linear-gradient(90deg, var(--brand), var(--nav-active))",
              }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Based on the assignments that have been graded so far.
          </p>
        </div> */}

        {/* Number of graded assignments */}
        <div className="card rounded-2xl p-4">
          <div className="flex items-center justify-between gap-4 min-h-[64px]">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--text-muted)] flex items-center gap-2">
                <BookOpenCheck className="w-4 h-4 text-brand" />
                Graded assignments
              </div>
              <p className="mt-2 text-xs text-[var(--text-muted)]">
                Total assignments in this course that have received a grade.
              </p>
            </div>
            <div className="mr-4 flex-shrink-0 text-3xl font-bold text-foreground flex items-center">
              {loading && !stats ? "…" : completedCount}
            </div>
          </div>
        </div>

        {/* Progress towards the final grade */}
        {/* <div className="card rounded-2xl p-4">
          <div className="text-sm font-semibold text-[var(--text-muted)] flex items-center gap-2">
            <Award className="w-4 h-4 text-brand" />
            Grade progress
          </div>
          <div className="mt-2 text-lg font-semibold text-foreground">
            Weighted coverage: {loading && !stats ? "…" : `${totalWeightCovered}%`}
          </div>
          <div className="mt-1 text-sm text-foreground">
            Cumulative weighted score:{" "}
            {loading && !stats ? "…" : totalWeightedScore.toFixed(2)}
          </div>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Shows how much of your final grade has been revealed and counted.
          </p>
        </div> */}
      </div>

      {/* Assignments list */}
      <div className="card rounded-2xl overflow-hidden">
        <div className="px-4 py-3 text-sm font-bold text-nav border-b border-[var(--border)]">
          Assignments ({rows.length})
        </div>

        {/* Table header (desktop) */}
        <div className="hidden md:grid grid-cols-12 px-4 py-2 text-xs font-semibold text-[var(--text-muted)] border-b border-[var(--border)]">
          <div className="col-span-6">Title</div>
          <div className="col-span-2 text-center">Score</div>
          <div className="col-span-1" />
          <div className="col-span-3 text-center">Status</div>
        </div>

        <ul className="divide-y divide-[var(--border)]">
          {loading && !rows.length && (
            <li className="px-4 py-8 text-center text-[var(--text-muted)]">
              Loading grades…
            </li>
          )}

          {!loading && pageRows.length === 0 && (
            <li className="px-4 py-8 text-center text-[var(--text-muted)]">
              No assignments to show.
            </li>
          )}

          {pageRows.map((r) => {
            const dueLabel = formatDateTimeVN(r.dueDate);

            return (
              <li
                key={r.assignmentId}
                className="px-4 py-4 hover:bg-white/40 transition-colors"
              >
                {/* Desktop row */}
                <div className="hidden md:grid grid-cols-12 items-center gap-3">
                  <div className="col-span-6 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <Link
                        href={`/student/courses/${courseId}/assignments/${r.assignmentId}`}
                        className="font-medium text-foreground hover:underline truncate"
                      >
                        {r.assignmentName}
                      </Link>
                    </div>
                    <div className="mt-1 text-[11px] text-[var(--text-muted)] flex items-center gap-2">
                      <CalendarDays className="w-3 h-3" />
                      Due: {dueLabel}
                    </div>
                  </div>
                  <div className="col-span-2 text-center text-sm">
                    {r.score === null ? (
                      <span className="text-[var(--text-muted)]">—</span>
                    ) : (
                      <span className="font-medium">
                        {r.score}/{r.maxPoints}
                        {r.percentage !== null &&
                          r.percentage !== undefined &&
                          ` (${Math.round(Number(r.percentage))}%)`}
                      </span>
                    )}
                    <span className="ml-2">
                      <GradeBadge percentage={r.percentage} />
                    </span>
                  </div>

                  <div className="col-span-1" />

                  <div className="col-span-3 text-center">
                    <StatusPill status={r.status} />
                  </div>
                </div>

                {/* Mobile row */}
                <div className="md:hidden flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/student/courses/${courseId}/assignments/${r.assignmentId}`}
                          className="font-medium text-foreground hover:underline truncate"
                        >
                          {r.assignmentName}
                        </Link>
                      </div>
                      <div className="mt-1 text-[11px] text-[var(--text-muted)] flex items-center gap-2">
                        <CalendarDays className="w-3 h-3" />
                        Due: {dueLabel}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <StatusPill status={r.status} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="text-foreground/80">
                      {r.score === null ? (
                        <span className="text-[var(--text-muted)]">—</span>
                      ) : (
                        <span className="font-medium">
                          {r.score}/{r.maxPoints}
                          {r.percentage !== null &&
                            r.percentage !== undefined &&
                            ` (${Math.round(Number(r.percentage))}%)`}
                        </span>
                      )}
                      <span className="ml-2 align-middle">
                        <GradeBadge percentage={r.percentage} />
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
          <div className="text-xs text-[var(--text-muted)]">
            Page <b>{page}</b> of <b>{totalPages}</b> • {rows.length} items
          </div>
          <div className="flex items-center gap-2">
            <button
              className={`btn bg-white border border-brand text-nav hover:text-nav-active ${
                page === 1 ? "opacity-60 cursor-not-allowed" : ""
              }`}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>
            <button
              className={`btn btn-gradient-slow ${
                page === totalPages ? "opacity-60 cursor-not-allowed" : ""
              }`}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

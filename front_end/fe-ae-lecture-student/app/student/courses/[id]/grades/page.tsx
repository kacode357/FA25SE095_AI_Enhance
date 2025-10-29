"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  Percent,
  BookOpenCheck,
  Filter,
  CalendarDays,
  FileText,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleAlert,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

// ---- Dummy UI data (no API) ----
type Row = {
  id: string;
  title: string;
  isGroup: boolean;
  dueDate: string; // ISO
  weight: number;  // %
  maxPoints: number;
  score: number | null; // null = not graded yet
  status: "Graded" | "Submitted" | "Missing" | "Late" | "Not Submitted";
};

const DUMMY_ROWS: Row[] = [
  { id: "a1", title: "Essay: Ethics & AI", isGroup: false, dueDate: "2025-03-12T23:59:59Z", weight: 10, maxPoints: 100, score: 92, status: "Graded" },
  { id: "a2", title: "Quiz 1: Fundamentals", isGroup: false, dueDate: "2025-03-20T23:59:59Z", weight: 5, maxPoints: 20, score: 18, status: "Graded" },
  { id: "a3", title: "Project Proposal", isGroup: true, dueDate: "2025-04-01T23:59:59Z", weight: 15, maxPoints: 100, score: 85, status: "Graded" },
  { id: "a4", title: "Midterm Exam", isGroup: false, dueDate: "2025-04-15T23:59:59Z", weight: 25, maxPoints: 100, score: 78, status: "Graded" },
  { id: "a5", title: "Lab 02: Data Cleaning", isGroup: false, dueDate: "2025-04-22T23:59:59Z", weight: 5, maxPoints: 10, score: 8, status: "Graded" },
  { id: "a6", title: "Group Report Draft", isGroup: true, dueDate: "2025-05-05T23:59:59Z", weight: 10, maxPoints: 100, score: null, status: "Submitted" },
  { id: "a7", title: "Presentation Slides", isGroup: true, dueDate: "2025-05-10T23:59:59Z", weight: 10, maxPoints: 50, score: null, status: "Not Submitted" },
  { id: "a8", title: "Final Exam", isGroup: false, dueDate: "2025-06-01T23:59:59Z", weight: 20, maxPoints: 100, score: null, status: "Missing" },
];

// ---- Helpers (UI only) ----
function pct(n: number, d: number) {
  if (!d) return 0;
  return Math.round((n / d) * 100);
}

function GradeBadge({ score, max }: { score: number | null; max: number }) {
  if (score === null) return (
    <span className="inline-flex items-center px-2 py-0.5 text-[11px] rounded-md border border-[var(--border)] text-[var(--text-muted)]">—</span>
  );
  const p = pct(score, max);
  const label = p >= 90 ? "A" : p >= 80 ? "B" : p >= 70 ? "C" : p >= 60 ? "D" : "F";
  const cls =
    p >= 90 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
    p >= 80 ? "bg-green-50 text-green-700 border-green-200" :
    p >= 70 ? "bg-amber-50 text-amber-700 border-amber-200" :
    p >= 60 ? "bg-orange-50 text-orange-700 border-orange-200" :
              "bg-red-50 text-red-700 border-red-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] rounded-md border ${cls}`}>{label}</span>
  );
}

function StatusPill({ status }: { status: Row["status"] }) {
  switch (status) {
    case "Graded":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CircleCheck className="w-3 h-3" /> Graded
        </span>
      );
    case "Submitted":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
          <FileText className="w-3 h-3" /> Submitted
        </span>
      );
    case "Missing":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">
          <CircleAlert className="w-3 h-3" /> Missing
        </span>
      );
    case "Late":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
          <CircleAlert className="w-3 h-3" /> Late
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
          <FileText className="w-3 h-3" /> Not Submitted
        </span>
      );
  }
}

export default function GradesPage() {
  const { id } = useParams();
  const router = useRouter();
  const courseId = typeof id === "string" ? id : "";

  // UI state (no API)
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "group" | "individual">("all");
  const [statusFilter, setStatusFilter] = useState<Row["status"] | "all">("all");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filtered = useMemo(() => {
    return DUMMY_ROWS.filter((r) => {
      const matchesSearch = !search || r.title.toLowerCase().includes(search.toLowerCase());
      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "group" && r.isGroup) ||
        (typeFilter === "individual" && !r.isGroup);
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [search, typeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Summary (UI-only)
  const graded = filtered.filter((r) => r.status === "Graded");
  const totalWeighted = graded.reduce((acc, r) => acc + r.weight, 0);
  const weightedPct = (() => {
    if (totalWeighted === 0) return 0;
    const sum = graded.reduce((acc, r) => {
      const p = r.score === null ? 0 : (r.score / r.maxPoints) * r.weight;
      return acc + p;
    }, 0);
    return Math.round((sum / totalWeighted) * 100);
  })();

  const gpa = (() => {
    if (!graded.length) return 0.0;
    const pts = graded.map((r) => {
      const p = r.score ? pct(r.score, r.maxPoints) : 0;
      if (p >= 90) return 4.0;
      if (p >= 80) return 3.0;
      if (p >= 70) return 2.0;
      if (p >= 60) return 1.0;
      return 0.0;
    });
    const avg = pts.reduce((a: number, b: number) => a + b, 0.0) / pts.length;
    return Math.round(avg * 100) / 100;
  })();

  const completedCount = graded.length;

  return (
    <motion.div
      className="flex flex-col gap-6 py-6 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-nav flex items-center gap-2">
          <Award className="w-7 h-7 text-nav-active" />
          Grades
        </h1>
        <button
          className="btn bg-white border border-brand text-nav hover:text-nav-active"
          onClick={() => router.push(`/student/courses/${courseId}`)}
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Course
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card rounded-2xl p-4">
          <div className="text-sm font-semibold text-[var(--text-muted)] flex items-center gap-2">
            <Percent className="w-4 h-4 text-brand" />
            Weighted Grade
          </div>
          <div className="mt-2 text-3xl font-bold text-foreground">{weightedPct}%</div>
          <div className="mt-2 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${weightedPct}%`,
                background: "linear-gradient(90deg, var(--brand), var(--nav-active))",
              }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Based on graded items only. Total weight graded: {totalWeighted}%.
          </p>
        </div>

        <div className="card rounded-2xl p-4">
          <div className="text-sm font-semibold text-[var(--text-muted)] flex items-center gap-2">
            <BookOpenCheck className="w-4 h-4 text-brand" />
            Completed Assignments
          </div>
          <div className="mt-2 text-3xl font-bold text-foreground">{completedCount}</div>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Items marked as <span className="font-semibold">Graded</span>.
          </p>
        </div>

        <div className="card rounded-2xl p-4">
          <div className="text-sm font-semibold text-[var(--text-muted)] flex items-center gap-2">
            <Award className="w-4 h-4 text-brand" />
            Estimated GPA
          </div>
          <div className="mt-2 text-3xl font-bold text-foreground">{gpa.toFixed(2)}</div>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            UI-only estimate from current graded items.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card rounded-2xl p-4">
        <div className="text-sm font-bold text-nav flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-[var(--text-muted)]" />
          Filters
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            className="input md:col-span-2"
            placeholder="Search assignment…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />

          <div className="relative">
            <select
              className="input pr-8 appearance-none"
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value as any); setPage(1); }}
            >
              <option value="all">All types</option>
              <option value="individual">Individual</option>
              <option value="group">Group</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]" />
          </div>

          <div className="relative">
            <select
              className="input pr-8 appearance-none"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
            >
              <option value="all">All statuses</option>
              <option value="Graded">Graded</option>
              <option value="Submitted">Submitted</option>
              <option value="Missing">Missing</option>
              <option value="Late">Late</option>
              <option value="Not Submitted">Not Submitted</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]" />
          </div>
        </div>
      </div>

      {/* Table-like list */}
      <div className="card rounded-2xl overflow-hidden">
        <div className="px-4 py-3 text-sm font-bold text-nav border-b border-[var(--border)]">
          Assignments ({filtered.length})
        </div>

        {/* Table header (desktop) */}
        <div className="hidden md:grid grid-cols-12 px-4 py-2 text-xs font-semibold text-[var(--text-muted)] border-b border-[var(--border)]">
          <div className="col-span-5">Title</div>
          <div className="col-span-2">Due</div>
          <div className="col-span-1 text-right">Weight</div>
          <div className="col-span-2 text-right">Score</div>
          <div className="col-span-2 text-right pr-2">Status</div>
        </div>

        <ul className="divide-y divide-[var(--border)]">
          {pageRows.length === 0 && (
            <li className="px-4 py-8 text-center text-[var(--text-muted)]">No items found.</li>
          )}

          {pageRows.map((r) => {
            const due = new Date(r.dueDate);
            const scorePct = r.score === null ? null : pct(r.score, r.maxPoints);

            return (
              <li key={r.id} className="px-4 py-4 hover:bg-white/40 transition-colors">
                {/* Desktop row */}
                <div className="hidden md:grid grid-cols-12 items-center gap-3">
                  <div className="col-span-5 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <Link
                        href={`/student/courses/${courseId}/assignments/${r.id}`}
                        className="font-medium text-foreground hover:underline truncate"
                      >
                        {r.title}
                      </Link>
                      {r.isGroup && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Users className="w-3 h-3" />
                          Group
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-[11px] text-[var(--text-muted)] flex items-center gap-2">
                      <CalendarDays className="w-3 h-3" />
                      Due: {due.toLocaleString("en-GB")}
                    </div>
                  </div>

                  <div className="col-span-2 text-sm text-foreground/80">
                    <div className="md:hidden inline-flex items-center gap-2 mr-2">
                      <CalendarDays className="w-4 h-4" />
                      {due.toLocaleDateString("en-GB")}
                    </div>
                  </div>

                  <div className="col-span-1 text-right text-sm">{r.weight}%</div>

                  <div className="col-span-2 text-right text-sm">
                    {r.score === null ? (
                      <span className="text-[var(--text-muted)]">—</span>
                    ) : (
                      <span className="font-medium">
                        {r.score}/{r.maxPoints} ({scorePct}%)
                      </span>
                    )}
                    <span className="ml-2"><GradeBadge score={r.score} max={r.maxPoints} /></span>
                  </div>

                  <div className="col-span-2 text-right"><StatusPill status={r.status} /></div>
                </div>

                {/* Mobile row */}
                <div className="md:hidden flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/student/courses/${courseId}/assignments/${r.id}`}
                          className="font-medium text-foreground hover:underline truncate"
                        >
                          {r.title}
                        </Link>
                        {r.isGroup && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <Users className="w-3 h-3" />
                            Group
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-[11px] text-[var(--text-muted)] flex items-center gap-2">
                        <CalendarDays className="w-3 h-3" />
                        Due: {due.toLocaleString("en-GB")}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <StatusPill status={r.status} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="text-foreground/70">Weight: <b>{r.weight}%</b></div>
                    <div className="text-foreground/80">
                      {r.score === null ? (
                        <span className="text-[var(--text-muted)]">—</span>
                      ) : (
                        <span className="font-medium">
                          {r.score}/{r.maxPoints} ({scorePct}%)
                        </span>
                      )}
                      <span className="ml-2 align-middle"><GradeBadge score={r.score} max={r.maxPoints} /></span>
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
            Page <b>{page}</b> of <b>{totalPages}</b> • {filtered.length} items
          </div>
          <div className="flex items-center gap-2">
            <button
              className={`btn bg-white border border-brand text-nav hover:text-nav-active ${page === 1 ? "opacity-60 cursor-not-allowed" : ""}`}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>
            <button
              className={`btn btn-gradient-slow ${page === totalPages ? "opacity-60 cursor-not-allowed" : ""}`}
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

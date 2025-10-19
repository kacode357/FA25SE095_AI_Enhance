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

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ---- Dummy UI data (no API) ----
type Row = {
  id: string;
  title: string;
  isGroup: boolean;
  dueDate: string; // ISO
  weight: number; // %
  maxPoints: number;
  score: number | null; // null = not graded yet
  status: "Graded" | "Submitted" | "Missing" | "Late" | "Not Submitted";
};

const DUMMY_ROWS: Row[] = [
  {
    id: "a1",
    title: "Essay: Ethics & AI",
    isGroup: false,
    dueDate: "2025-03-12T23:59:59Z",
    weight: 10,
    maxPoints: 100,
    score: 92,
    status: "Graded",
  },
  {
    id: "a2",
    title: "Quiz 1: Fundamentals",
    isGroup: false,
    dueDate: "2025-03-20T23:59:59Z",
    weight: 5,
    maxPoints: 20,
    score: 18,
    status: "Graded",
  },
  {
    id: "a3",
    title: "Project Proposal",
    isGroup: true,
    dueDate: "2025-04-01T23:59:59Z",
    weight: 15,
    maxPoints: 100,
    score: 85,
    status: "Graded",
  },
  {
    id: "a4",
    title: "Midterm Exam",
    isGroup: false,
    dueDate: "2025-04-15T23:59:59Z",
    weight: 25,
    maxPoints: 100,
    score: 78,
    status: "Graded",
  },
  {
    id: "a5",
    title: "Lab 02: Data Cleaning",
    isGroup: false,
    dueDate: "2025-04-22T23:59:59Z",
    weight: 5,
    maxPoints: 10,
    score: 8,
    status: "Graded",
  },
  {
    id: "a6",
    title: "Group Report Draft",
    isGroup: true,
    dueDate: "2025-05-05T23:59:59Z",
    weight: 10,
    maxPoints: 100,
    score: null,
    status: "Submitted",
  },
  {
    id: "a7",
    title: "Presentation Slides",
    isGroup: true,
    dueDate: "2025-05-10T23:59:59Z",
    weight: 10,
    maxPoints: 50,
    score: null,
    status: "Not Submitted",
  },
  {
    id: "a8",
    title: "Final Exam",
    isGroup: false,
    dueDate: "2025-06-01T23:59:59Z",
    weight: 20,
    maxPoints: 100,
    score: null,
    status: "Missing",
  },
];

// ---- Helpers (UI only) ----
function pct(n: number, d: number) {
  if (!d) return 0;
  return Math.round((n / d) * 100);
}

function gradeBadge(score: number | null, maxPoints: number) {
  if (score === null) return <Badge variant="outline">—</Badge>;
  const p = pct(score, maxPoints);
  if (p >= 90) return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">A</Badge>;
  if (p >= 80) return <Badge className="bg-green-50 text-green-700 border-green-200">B</Badge>;
  if (p >= 70) return <Badge className="bg-amber-50 text-amber-700 border-amber-200">C</Badge>;
  if (p >= 60) return <Badge className="bg-orange-50 text-orange-700 border-orange-200">D</Badge>;
  return <Badge className="bg-red-50 text-red-700 border-red-200">F</Badge>;
}

function statusPill(status: Row["status"]) {
  switch (status) {
    case "Graded":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CircleCheck className="w-3 h-3" />
          Graded
        </span>
      );
    case "Submitted":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
          <FileText className="w-3 h-3" />
          Submitted
        </span>
      );
    case "Missing":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">
          <CircleAlert className="w-3 h-3" />
          Missing
        </span>
      );
    case "Late":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
          <CircleAlert className="w-3 h-3" />
          Late
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
          <FileText className="w-3 h-3" />
          Not Submitted
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
      const matchesSearch =
        !search ||
        r.title.toLowerCase().includes(search.toLowerCase());
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
    
    // FIX TypeScript Error: 'Type 'number' is not assignable to type '1 | 0 | 4 | 3 | 2'.'
    const pts: number[] = graded.map((r) => { // <-- Khai báo rõ là number[] để tránh Literal Type
      const p = r.score ? pct(r.score, r.maxPoints) : 0;
      if (p >= 90) return 4.0;
      if (p >= 80) return 3.0;
      if (p >= 70) return 2.0;
      if (p >= 60) return 1.0;
      return 0.0;
    });
    
    // Cung cấp initial value (0.0) để reduce biết accumulator là kiểu number
    const avg = pts.reduce((a, b) => a + b, 0.0) / pts.length; 
    return Math.round(avg * 100) / 100;
  })();
  // Hết phần FIX LỖI TypeScript

  const completedCount = graded.length;

  return (
    <motion.div
      className="flex flex-col gap-6 py-6"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-green-700 flex items-center gap-2">
          <Award className="w-7 h-7 text-green-600" />
          Grades
        </h1>
        <Button
          variant="outline"
          onClick={() => router.push(`/student/courses/${courseId}`)}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Course
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-2">
              <Percent className="w-4 h-4 text-green-600" />
              Weighted Grade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{weightedPct}%</div>
            <div className="mt-2 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-2 rounded-full transition-all",
                  weightedPct >= 90
                    ? "bg-emerald-500"
                    : weightedPct >= 70
                    ? "bg-green-500"
                    : weightedPct >= 60
                    ? "bg-amber-500"
                    : "bg-red-500"
                )}
                style={{ width: `${weightedPct}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Based on graded items only. Total weight graded: {totalWeighted}%
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-2">
              <BookOpenCheck className="w-4 h-4 text-indigo-600" />
              Completed Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{completedCount}</div>
            <p className="mt-2 text-xs text-slate-500">
              Items marked as <span className="font-semibold">Graded</span>.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              Estimated GPA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{gpa.toFixed(2)}</div>
            <p className="mt-2 text-xs text-slate-500">UI-only estimate from current graded items.</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-600" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="col-span-1 md:col-span-2">
            <Input
              placeholder="Search assignment…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <Select
            value={typeFilter}
            onValueChange={(v: any) => {
              setTypeFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="group">Group</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(v: any) => {
              setStatusFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Graded">Graded</SelectItem>
              <SelectItem value="Submitted">Submitted</SelectItem>
              <SelectItem value="Missing">Missing</SelectItem>
              <SelectItem value="Late">Late</SelectItem>
              <SelectItem value="Not Submitted">Not Submitted</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table-like list */}
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-slate-800">
            Assignments ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:grid grid-cols-12 px-4 py-2 text-xs font-semibold text-slate-500 border-b">
            <div className="col-span-5">Title</div>
            <div className="col-span-2">Due</div>
            <div className="col-span-1 text-right">Weight</div>
            <div className="col-span-2 text-right">Score</div>
            <div className="col-span-2 text-right pr-2">Status</div>
          </div>

          <ul className="divide-y">
            {pageRows.length === 0 && (
              <li className="px-4 py-8 text-center text-slate-500">No items found.</li>
            )}

            {pageRows.map((r) => {
              const due = new Date(r.dueDate);
              const scorePct = r.score === null ? null : pct(r.score, r.maxPoints);

              return (
                <li key={r.id} className="px-4 py-4 hover:bg-slate-50/60 transition-colors">
                  {/* Desktop */}
                  <div className="hidden md:grid grid-cols-12 items-center gap-3">
                    <div className="col-span-5 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/student/courses/${courseId}/assignments/${r.id}`}
                          className="font-medium text-slate-900 hover:underline truncate"
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
                      <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-2">
                        <CalendarDays className="w-3 h-3" />
                        Due: {due.toLocaleString("en-GB")}
                      </div>
                    </div>

                    <div className="col-span-2 text-sm text-slate-700">
                      <div className="md:hidden inline-flex items-center gap-2 mr-2">
                        <CalendarDays className="w-4 h-4" />
                        {due.toLocaleDateString("en-GB")}
                      </div>
                    </div>

                    <div className="col-span-1 text-right text-sm">{r.weight}%</div>

                    <div className="col-span-2 text-right text-sm">
                      {r.score === null ? (
                        <span className="text-slate-400">—</span>
                      ) : (
                        <span className="font-medium">
                          {r.score}/{r.maxPoints} ({scorePct}%)
                        </span>
                      )}
                      <span className="ml-2">{gradeBadge(r.score, r.maxPoints)}</span>
                    </div>

                    <div className="col-span-2 text-right">{statusPill(r.status)}</div>
                  </div>

                  {/* Mobile */}
                  <div className="md:hidden flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/student/courses/${courseId}/assignments/${r.id}`}
                            className="font-medium text-slate-900 hover:underline truncate"
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
                        <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-2">
                          <CalendarDays className="w-3 h-3" />
                          Due: {due.toLocaleString("en-GB")}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        {statusPill(r.status)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="text-slate-600">Weight: <b>{r.weight}%</b></div>
                      <div className="text-slate-700">
                        {r.score === null ? (
                          <span className="text-slate-400">—</span>
                        ) : (
                          <span className="font-medium">
                            {r.score}/{r.maxPoints} ({scorePct}%)
                          </span>
                        )}
                        <span className="ml-2 align-middle">{gradeBadge(r.score, r.maxPoints)}</span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-xs text-slate-500">
              Page <b>{page}</b> of <b>{totalPages}</b> • {filtered.length} items
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </Button>
              <Button
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
     
    </motion.div>
  );
}
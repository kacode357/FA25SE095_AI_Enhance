// app/student/dashboard/page.tsx
"use client";

import { CalendarDays, Sparkles, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useStudentGradesOverview } from "@/hooks/dashboard/useStudentGradesOverview";
import { useStudentPerformanceAnalytics } from "@/hooks/dashboard/useStudentPerformanceAnalytics";
import { useTerms } from "@/hooks/term/useTerms";

import DashboardCurrentCourses from "./components/DashboardCurrentCourses";
import DashboardGradeDistribution from "./components/DashboardGradeDistribution";
import DashboardGradeBreakdown from "./components/DashboardGradeBreakdown";
import DashboardOverviewCard from "./components/DashboardOverviewCard";
import DashboardPendingAssignments from "./components/DashboardPendingAssignments";
import DashboardPerformanceCard from "./components/DashboardPerformanceCard";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function StudentDashboardPage() {
  const { data: terms, loading: termsLoading, fetchTerms } = useTerms();
  const [termId, setTermId] = useState<string | undefined>();

  // Single fetch for overview + analytics (avoid duplicate calls across cards)
  const {
    data: overview,
    loading: overviewLoading,
    fetchOverview,
  } = useStudentGradesOverview();
  const {
    data: analytics,
    loading: analyticsLoading,
    fetchAnalytics,
  } = useStudentPerformanceAnalytics();

  // Fetch terms on load
  useEffect(() => {
    fetchTerms();
  }, []);

  // Set default term after load
  useEffect(() => {
    if (terms.length > 0 && !termId) {
      setTermId(terms[0].id);
    }
  }, [terms]);

  // Fetch dashboard data when term changes
  useEffect(() => {
    if (!termId) return;
    fetchOverview(termId);
    fetchAnalytics(termId);
  }, [termId]);

  const gradeDistribution = useMemo(
    () => overview?.data.gradeDistribution,
    [overview],
  );

  const quickStats = useMemo(
    () => [
      {
        label: "Courses",
        value: overview?.data.courses.length ?? "—",
      },
      {
        label: "On-time rate",
        value:
          analytics?.data.onTimeSubmissionRate !== undefined
            ? `${analytics.data.onTimeSubmissionRate}%`
            : "—",
      },
      {
        label: "Submissions",
        value: analytics?.data.totalSubmissions ?? "—",
      },
    ],
    [overview, analytics],
  );

  return (
    <div className="mx-auto max-w-6xl px-2 py-6 space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-5 shadow-sm transition duration-300 hover:-translate-y-[2px] hover:shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(127,113,244,0.18),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(244,162,59,0.14),transparent_35%)] blur-2xl" />
        <div className="absolute -left-12 bottom-0 h-44 w-44 rounded-full bg-indigo-100/50 blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="flex items-center gap-2 text-2xl font-semibold text-nav">
              <CalendarDays className="h-6 w-6 text-indigo-500" />
              Student Dashboard
              <Sparkles className="h-5 w-5 text-amber-400" />
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl">
              Fresh snapshot of your GPA, submissions, and course load — with a calmer, staged layout.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {quickStats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-white/80 px-3 py-2 text-xs shadow-sm backdrop-blur"
                >
                  <Zap className="h-3.5 w-3.5 text-indigo-500" />
                  <div>
                    <div className="text-[11px] text-slate-500">{stat.label}</div>
                    <div className="font-semibold text-nav">{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SELECT TERM */}
          <div className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-white/70 px-3 py-2 shadow-md backdrop-blur transition hover:-translate-y-[1px]">
            <span className="text-sm text-slate-600">Select term</span>
            <Select
              disabled={termsLoading || !terms.length}
              value={termId ?? ""}
              onValueChange={(val) => setTermId(val)}
            >
              <SelectTrigger className="w-44 border-indigo-100 bg-white">
                <SelectValue placeholder="Choose term" />
              </SelectTrigger>
              <SelectContent>
                {terms.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* TOP GRID */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DashboardOverviewCard
            data={overview?.data}
            loading={overviewLoading}
          />
          <DashboardPerformanceCard
            data={analytics?.data}
            loading={analyticsLoading}
          />
        </div>
        <DashboardGradeDistribution
          distribution={gradeDistribution}
          loading={overviewLoading}
        />
      </div>

      {/* BOTTOM GRID */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DashboardPendingAssignments />
        <DashboardCurrentCourses />
      </div>

      {/* GRADE BREAKDOWN SECTION */}
      <div className="mt-4">
        <DashboardGradeBreakdown
          coursesData={overview?.data}
          loading={overviewLoading}
        />
      </div>
    </div>
  );
}

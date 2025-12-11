"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Sparkles, Zap } from "lucide-react";

import { useTerms } from "@/hooks/term/useTerms";
import { useMyCourses } from "@/hooks/course/useMyCourses";

import { useLecturerCoursesOverview } from "@/hooks/dashboard/useLecturerCoursesOverview";
import { useLecturerPendingGrading } from "@/hooks/dashboard/useLecturerPendingGrading";
import { useLecturerAssignmentsStatistics } from "@/hooks/dashboard/useLecturerAssignmentsStatistics";
import { useLecturerStudentsPerformance } from "@/hooks/dashboard/useLecturerStudentsPerformance";

import CoursesOverviewCard from "./components/CoursesOverviewCard";
import PendingGradingCard from "./components/PendingGradingCard";
import AssignmentsStatisticsCard from "./components/AssignmentsStatisticsCard";
import StudentsPerformanceCard from "./components/StudentsPerformanceCard";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function LecturerDashboardPage() {
  const { data: terms, loading: termsLoading, fetchTerms } = useTerms();
  const {
    listData: myCourses,
    loading: coursesLoading,
    fetchMyCourses,
  } = useMyCourses();

  const {
    data: overview,
    loading: overviewLoading,
    fetchCoursesOverview,
  } = useLecturerCoursesOverview();
  const {
    data: pending,
    loading: pendingLoading,
    fetchPendingGrading,
  } = useLecturerPendingGrading();
  const {
    data: assignmentsStats,
    loading: assignmentsLoading,
    fetchAssignmentsStatistics,
  } = useLecturerAssignmentsStatistics();
  const {
    data: studentsPerformance,
    loading: performanceLoading,
    fetchStudentsPerformance,
  } = useLecturerStudentsPerformance();

  const [selectedTermId, setSelectedTermId] = useState<string | undefined>();
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>();
  const [syncingCourse, setSyncingCourse] = useState(false);

  // Initial load: fetch terms, then courses, then default selections
  useEffect(() => {
    const init = async () => {
      const termRes = await fetchTerms();
      if (termRes?.terms?.length) {
        setSelectedTermId((prev) => prev ?? termRes.terms[0].id);
      }

      const courseRes = await fetchMyCourses({
        asLecturer: true,
        page: 1,
        pageSize: 10,
      });
      if (courseRes?.courses?.length) {
        setSelectedCourseId((prev) => prev ?? courseRes.courses[0].id);
      }
    };

    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-select first term if terms array changes after initial load
  useEffect(() => {
    if (terms.length > 0 && !selectedTermId) {
      setSelectedTermId(terms[0].id);
    }
  }, [terms, selectedTermId]);

  // Sequentially fetch dashboard data when term/course changes
  useEffect(() => {
    if (!selectedTermId) return;
    void fetchCoursesOverview(selectedTermId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTermId]);

  // Fetch course-scoped data when course changes
  useEffect(() => {
    if (!selectedCourseId) return;

    const run = async () => {
      setSyncingCourse(true);
      try {
        await fetchAssignmentsStatistics(selectedCourseId);
        await fetchPendingGrading(selectedCourseId);
        await fetchStudentsPerformance(selectedCourseId);
      } finally {
        setSyncingCourse(false);
      }
    };

    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseId]);

  const selectedCourse = useMemo(
    () => myCourses.find((c) => c.id === selectedCourseId),
    [myCourses, selectedCourseId],
  );

  const quickStats = useMemo(
    () => [
      {
        label: "Students",
        value: overview?.data.totalStudentsEnrolled ?? "N/A",
      },
      {
        label: "Pending grading",
        value: pending?.data.totalPending ?? "N/A",
      },
      {
        label: "Submission rate",
        value: assignmentsStats
          ? `${formatNumber(assignmentsStats.data.overallSubmissionRate)}%`
          : "N/A",
      },
      {
        label: "Active assignments",
        value: overview?.data.totalActiveAssignments ?? "N/A",
      },
    ],
    [overview, pending, assignmentsStats],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-3 py-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-sky-50 p-6 shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(99,102,241,0.12),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(56,189,248,0.12),transparent_35%)] blur-2xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <h1 className="flex items-center gap-2 text-2xl font-semibold text-nav">
              <CalendarDays className="h-6 w-6 text-indigo-500" />
              Lecturer Dashboard
              <Sparkles className="h-5 w-5 text-amber-400" />
            </h1>
            <p className="max-w-2xl text-sm text-slate-600">
              Monitor course health, grading workload, and student performance with paced requests - APIs are fetched one after another, not all at once.
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {quickStats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-white/80 px-3 py-2 text-xs shadow-sm"
                >
                  <Zap className="h-3.5 w-3.5 text-indigo-500" />
                  <div>
                    <div className="text-[11px] text-slate-500">
                      {stat.label}
                    </div>
                    <div className="font-semibold text-nav">{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selectors */}
          <div className="flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-white/80 p-4 shadow">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Term</span>
              <Select
                disabled={termsLoading || !terms.length}
                value={selectedTermId ?? ""}
                onValueChange={(val) => setSelectedTermId(val)}
              >
                <SelectTrigger className="w-64 border-indigo-100 bg-white">
                  <SelectValue placeholder="Choose term" />
                </SelectTrigger>
                <SelectContent>
                  {terms.map((term) => (
                    <SelectItem key={term.id} value={term.id}>
                      {term.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Course</span>
              <Select
                disabled={coursesLoading || myCourses.length === 0}
                value={selectedCourseId ?? ""}
                onValueChange={(val) => setSelectedCourseId(val)}
              >
                <SelectTrigger className="w-64 border-indigo-100 bg-white">
                  <SelectValue placeholder="Choose course" />
                </SelectTrigger>
                <SelectContent>
                  {myCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Badge variant="outline" className="w-fit text-[11px]">
              {selectedCourse
                ? `${selectedCourse.courseCode} - ${selectedCourse.term}`
                : "No course selected"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <CoursesOverviewCard
          data={overview?.data}
          loading={overviewLoading}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <AssignmentsStatisticsCard
            data={assignmentsStats?.data}
            loading={assignmentsLoading || syncingCourse}
            courseId={selectedCourseId}
          />
          <PendingGradingCard
            data={pending?.data}
            loading={pendingLoading || syncingCourse}
            courseId={selectedCourseId}
          />
        </div>

        <StudentsPerformanceCard
          data={studentsPerformance?.data}
          loading={performanceLoading || syncingCourse}
        />
      </div>
    </div>
  );
}

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "N/A";
  return Number.isFinite(value) ? value.toFixed(1) : "N/A";
}

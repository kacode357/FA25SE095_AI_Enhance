"use client";

import { BookOpen, CalendarDays, DownloadCloud, Layers } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useMyCourses } from "@/hooks/course/useMyCourses";
import { useDashboardTerms } from "@/hooks/dashboard/useDashboardTerms";

import { useLecturerAssignmentsStatistics } from "@/hooks/dashboard/useLecturerAssignmentsStatistics";
import { useLecturerCoursesOverview } from "@/hooks/dashboard/useLecturerCoursesOverview";
import { useLecturerPendingGrading } from "@/hooks/dashboard/useLecturerPendingGrading";
import { useLecturerStudentsPerformance } from "@/hooks/dashboard/useLecturerStudentsPerformance";

import AssignmentsStatisticsCard from "./components/AssignmentsStatisticsCard";
import CoursesOverviewCard from "./components/CoursesOverviewCard";
import PendingGradingCard from "./components/PendingGradingCard";
import StudentsPerformanceCard from "./components/StudentsPerformanceCard";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useExportCourseGrades } from "@/hooks/dashboard/useExportCourseGrades";

export default function LecturerDashboardPage() {
  const { data: termsResp, loading: termsLoading, fetchTerms } = useDashboardTerms();
  const terms = termsResp?.data?.terms ?? [];
  const currentTermIdFromApi = termsResp?.data?.currentTermId;
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

  const { exportCourseGrades, loading: exportLoading } = useExportCourseGrades();

  // Initial load: fetch terms, then courses, then default selections
  useEffect(() => {
    const init = async () => {
      const termRes = await fetchTerms();
      const apiTerms = termRes?.data?.terms ?? [];
      const apiCurrent = termRes?.data?.currentTermId;
      if (apiCurrent) {
        setSelectedTermId((prev) => prev ?? apiCurrent);
      } else if (apiTerms.length) {
        setSelectedTermId((prev) => prev ?? apiTerms[0].termId);
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
      setSelectedTermId(currentTermIdFromApi ?? terms[0].termId);
    }
  }, [terms, selectedTermId, currentTermIdFromApi]);

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
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-sky-50 p-6 shadow-sm">
        {/* Decorative Background Blobs */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(99,102,241,0.12),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(56,189,248,0.12),transparent_35%)] blur-2xl" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          
          {/* LEFT SIDE: Title, Description, Stats & Action */}
          <div className="flex-1 space-y-4 pr-4">
            <div className="space-y-2">
              <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-800">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-200">
                  <CalendarDays className="h-5 w-5" />
                </span>
                Lecturer Dashboard
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-slate-500">
                Monitor course health, grading workload, and student performance. Data is fetched sequentially to ensure stability.
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-2">
              {quickStats.map((stat) => (
                <div
                  key={stat.label}
                  className="group flex flex-col justify-between rounded-xl border border-slate-100 bg-white/60 p-3 backdrop-blur-sm transition-all hover:border-indigo-200 hover:bg-white hover:shadow-md"
                >
                  <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-slate-400 group-hover:text-indigo-500">
                    {stat.label}
                  </div>
                  <div className="font-bold text-slate-700">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Export Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={!selectedCourseId || exportLoading}
                onClick={() => selectedCourseId && exportCourseGrades(selectedCourseId)}
                className="inline-flex items-center btn btn-green-slow gap-2 rounded-lg bg-white border border-indigo-100 px-4 py-2 text-xs font-semibold text-indigo-600 shadow-sm transition-colors hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50"
              >
                <DownloadCloud className="h-3.5 w-3.5" />
                Export Gradebook
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: Redesigned Selectors (Glassmorphism Card) */}
          <div className="flex w-full flex-col gap-10 rounded-2xl border border-white/50 bg-white/40 p-5 shadow-sm backdrop-blur-md lg:w-[420px]">
            
            {/* Term Selector */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <Layers className="h-3 w-3" />
                Academic Term
              </label>
              <Select
                disabled={termsLoading || !terms.length}
                value={selectedTermId ?? ""}
                onValueChange={(val) => setSelectedTermId(val)}
              >
                <SelectTrigger className="h-11 w-full border-indigo-100 bg-white shadow-sm transition-all hover:border-indigo-300 focus:ring-2 focus:ring-indigo-100">
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent align="end" className="max-h-[300px]">
                  {terms.map((term) => (
                    <SelectItem key={term.termId} value={term.termId} className="py-2.5">
                      <div className="grid grid-cols-3 items-center gap-10">
                        <div className="min-w-0">
                          <span className="font-medium text-slate-700 truncate">{term.name}</span>
                        </div>
                        <div className="justify-self-center text-[10px] text-slate-400 whitespace-nowrap">
                          {new Date(term.startDate).toLocaleDateString()} — {new Date(term.endDate).toLocaleDateString()}
                        </div>
                        <div className="flex justify-end">
                          {term.isCurrent && (
                            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                              Current
                            </span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Course Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <BookOpen className="h-3 w-3" />
                  Course
                </label>
                {/* Course Code Badge inside label area */}
                {selectedCourse && (
                  <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600">
                    {selectedCourse.courseCodeTitle}
                  </span>
                )}
              </div>
              <Select
                disabled={coursesLoading || myCourses.length === 0}
                value={selectedCourseId ?? ""}
                onValueChange={(val) => setSelectedCourseId(val)}
              >
                <SelectTrigger className="h-11 w-full border-indigo-100 bg-white shadow-sm transition-all hover:border-indigo-300 focus:ring-2 focus:ring-indigo-100">
                  <SelectValue placeholder="Choose course" />
                </SelectTrigger>
                <SelectContent align="end">
                  {myCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      <span className="mr-2 text-slate-400">#{course.courseCode}</span>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Context Footer */}
            <div className="mt-1 flex items-center justify-center border-t border-indigo-100/50 pt-3">
               <span className="text-[10px] text-slate-400">
                  {selectedCourse ? (
                    <>Viewing Course overview in <span className="font-semibold text-indigo-600">{selectedCourse.term}</span></>
                  ) : "Please select a course"}
               </span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Dashboard Content */}
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
  return Number.isFinite(value) ? value.toFixed(2) : "N/A";
}

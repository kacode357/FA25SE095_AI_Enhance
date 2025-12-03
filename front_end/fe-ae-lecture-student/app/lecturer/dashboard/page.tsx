"use client";

import { useLecturerAssignmentsStatistics } from "@/hooks/dashboard/useLecturerAssignmentsStatistics";
import { useLecturerCoursesOverview } from "@/hooks/dashboard/useLecturerCoursesOverview";
import { useLecturerPendingGrading } from "@/hooks/dashboard/useLecturerPendingGrading";
import { useLecturerStudentsPerformance } from "@/hooks/dashboard/useLecturerStudentsPerformance";
import { cn } from "@/lib/utils";
import type {
    LecturerAssignmentPerformanceItem,
    LecturerAssignmentStatisticsItem,
    LecturerCourseOverviewItem,
    LecturerPendingReportItem,
    LecturerStudentPerformanceItem,
} from "@/types/dashboard/dashboard.response";
import Link from "next/link";
import ChartBar from "./components/ChartBar";
import Panel from "./components/Panel";
import Skeleton from "./components/Skeleton";
import Stat from "./components/Stat";
import Table from "./components/Table";
export default function LecturerDashboardPage() {
    const {
        data: coursesOverview,
        loading: coursesLoading,
        fetchCoursesOverview,
    } = useLecturerCoursesOverview();

    const {
        data: pendingGrading,
        loading: pendingLoading,
        fetchPendingGrading,
    } = useLecturerPendingGrading();

    const {
        data: studentsPerf,
        loading: perfLoading,
        fetchStudentsPerformance,
    } = useLecturerStudentsPerformance();

    const {
        data: assignmentsStats,
        loading: statsLoading,
        fetchAssignmentsStatistics,
    } = useLecturerAssignmentsStatistics();

    return (
        <div className="px-6 py-6 space-y-6">
            {/* Header actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#0A0F66]">Lecturer Dashboard</h1>
                    <p className="text-sm text-gray-500">Overview, grading workload and performance insights</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            fetchCoursesOverview?.();
                            fetchPendingGrading?.();
                            // Provide courseId if your hooks require it
                            // fetchStudentsPerformance?.(courseId)
                            // fetchAssignmentsStatistics?.(courseId)
                        }}
                        className="rounded-md border px-3 py-1.5 text-sm bg-white hover:bg-gray-50"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Panel title="Overview" right={<span className="text-xs text-gray-500">Today</span>}>
                    {coursesLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-6 w-40" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Skeleton className="h-16" />
                                <Skeleton className="h-16" />
                                <Skeleton className="h-16" />
                                <Skeleton className="h-16" />
                            </div>
                        </div>
                    ) : coursesOverview?.data ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Stat label="Total Students" value={coursesOverview.data.totalStudentsEnrolled} />
                            <Stat label="Pending Reports" value={coursesOverview.data.totalReportsPendingGrading} />
                            <Stat label="Active Assignments" value={coursesOverview.data.totalActiveAssignments} />
                            <Stat label="Courses" value={coursesOverview.data.courses?.length || 0} />
                            <div className="col-span-1 sm:col-span-2">
                                <ChartBar
                                  data={coursesOverview.data.courses?.map(() => Math.round(Math.random() * 100)) ?? [10,20,30,40]}
                                  labels={coursesOverview.data.courses?.map(c => c.courseCode) ?? ["A","B","C","D"]}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500">No data</div>
                    )}
                </Panel>

                <Panel title="Pending Grading" right={<span className="text-xs text-gray-500">Workload</span>}>
                    {pendingLoading ? (
                        <div className="text-sm text-gray-500">Loading pending…</div>
                    ) : pendingGrading?.data ? (
                        <div className="grid grid-cols-2 gap-4">
                            <Stat label="Total Pending" value={pendingGrading.data.totalPending} />
                            <Stat label="Resubmitted" value={pendingGrading.data.resubmittedCount} />
                            <Stat label="Submitted" value={pendingGrading.data.submittedCount} />
                            <Stat label="Items" value={pendingGrading.data.pendingReports?.length || 0} />
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500">No data</div>
                    )}
                </Panel>

                <Panel title="Course Performance" right={<span className="text-xs text-gray-500">Insights</span>}>
                    {perfLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-6 w-40" />
                            <div className="grid grid-cols-2 gap-4">
                                <Skeleton className="h-16" />
                                <Skeleton className="h-16" />
                                <Skeleton className="h-16" />
                                <Skeleton className="h-16" />
                            </div>
                        </div>
                    ) : studentsPerf?.data ? (
                        <div className="grid grid-cols-2 gap-4">
                            <Stat label="Avg Grade" value={`${studentsPerf.data.averageCourseGrade?.toFixed?.(2) ?? studentsPerf.data.averageCourseGrade}`} />
                            <Stat label="Submission Rate" value={`${Math.round((studentsPerf.data.submissionRate ?? 0) * 100) / 100}%`} />
                            <Stat label="Students" value={studentsPerf.data.totalStudents} />
                            <Stat label="Top Performers" value={studentsPerf.data.topPerformers?.length || 0} />
                            <div className="col-span-2">
                                <ChartBar
                                  data={(studentsPerf.data.assignmentPerformance ?? []).map(a => Math.round(a.averageGrade))}
                                  labels={(studentsPerf.data.assignmentPerformance ?? []).map(a => a.title)}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500">No data</div>
                    )}
                </Panel>

                <Panel title="Assignments Summary" right={<span className="text-xs text-gray-500">Overview</span>}>
                    {statsLoading ? (
                        <div className="text-sm text-gray-500">Loading stats…</div>
                    ) : assignmentsStats?.data ? (
                        <div className="grid grid-cols-2 gap-4">
                            <Stat label="Assignments" value={assignmentsStats.data.assignments?.length || 0} />
                            <Stat label="Overall Avg" value={`${assignmentsStats.data.overallAverageGrade?.toFixed?.(2) ?? assignmentsStats.data.overallAverageGrade}`} />
                            <Stat label="Submission Rate" value={`${assignmentsStats.data.overallSubmissionRate}%`} />
                            <Stat label="Course" value={assignmentsStats.data.courseName ?? "-"} />
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500">No data</div>
                    )}
                </Panel>
            </div>

            {/* Detailed tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Panel
                    title="My Courses"
                    right={
                        coursesOverview?.data?.courses && coursesOverview.data.courses.length > 0 ? (
                            <span className="text-xs text-muted-foreground">
                                {coursesOverview.data.courses.length} items
                            </span>
                        ) : null
                    }
                >
                    {coursesLoading ? (
                        <div className="text-sm text-gray-500">Loading…</div>
                    ) : (
                        <Table<LecturerCourseOverviewItem>
                            headers={[
                                "Course",
                                "Term",
                                "Enrollments",
                                "Active Assignments",
                                "Pending Grading",
                                "Last Submission",
                            ]}
                            rows={coursesOverview?.data?.courses ?? []}
                            emptyText="No courses"
                            renderRow={(c, i) => (
                                <tr key={i} className="border-b">
                                    <td className="p-2">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{c.courseName}</span>
                                            <span className="text-xs text-muted-foreground">{c.courseCode}</span>
                                        </div>
                                    </td>
                                    <td className="p-2">{c.termName}</td>
                                    <td className="p-2">{c.enrollmentCount}</td>
                                    <td className="p-2">{c.activeAssignmentsCount}</td>
                                    <td className="p-2">{c.pendingGradingCount}</td>
                                    <td className="p-2">{c.lastSubmissionDate ?? "-"}</td>
                                </tr>
                            )}
                        />
                    )}
                </Panel>

                <Panel
                    title="Pending Reports"
                    right={
                        pendingGrading?.data?.pendingReports && pendingGrading.data.pendingReports.length > 0 ? (
                            <span className="text-xs text-muted-foreground">
                                {pendingGrading.data.pendingReports.length} items
                            </span>
                        ) : null
                    }
                >
                    {pendingLoading ? (
                        <div className="text-sm text-gray-500">Loading…</div>
                    ) : (
                        <Table<LecturerPendingReportItem>
                            headers={[
                                "Assignment",
                                "Course",
                                "Submitted",
                                "Days",
                                "Group",
                                "Submitter",
                                "Status",
                            ]}
                            rows={pendingGrading?.data?.pendingReports ?? []}
                            emptyText="No pending reports"
                            renderRow={(r, i) => (
                                <tr key={i} className="border-b">
                                    <td className="p-2">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{r.assignmentTitle}</span>
                                            <span className="text-xs text-muted-foreground">#{r.assignmentId}</span>
                                        </div>
                                    </td>
                                    <td className="p-2">{r.courseName}</td>
                                    <td className="p-2">{r.submittedAt}</td>
                                    <td className="p-2">{r.daysSinceSubmission}</td>
                                    <td className="p-2">{r.isGroupSubmission ? r.groupName ?? "Group" : "Individual"}</td>
                                    <td className="p-2">{r.submitterName}</td>
                                    <td className="p-2">
                                        <span
                                            className={cn(
                                                "px-2 py-0.5 rounded text-xs",
                                                r.status === "Submitted" && "bg-blue-100 text-blue-700",
                                                r.status === "Resubmitted" && "bg-yellow-100 text-yellow-800",
                                                r.status === "Pending" && "bg-gray-100 text-gray-700",
                                            )}
                                        >
                                            {r.status}
                                        </span>
                                    </td>
                                </tr>
                            )}
                        />
                    )}
                </Panel>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Panel title="Assignment Performance">
                    {perfLoading ? (
                        <div className="text-sm text-gray-500">Loading…</div>
                    ) : (
                        <Table<LecturerAssignmentPerformanceItem>
                            headers={[
                                "Assignment",
                                "Avg Grade",
                                "Submissions",
                                "Total Students",
                                "Submission Rate",
                            ]}
                            rows={studentsPerf?.data?.assignmentPerformance ?? []}
                            emptyText="No assignment performance data"
                            renderRow={(a, i) => (
                                <tr key={i} className="border-b">
                                    <td className="p-2">
                                        <span className="font-medium">{a.title}</span>
                                    </td>
                                    <td className="p-2">{a.averageGrade}</td>
                                    <td className="p-2">{a.submissionCount}</td>
                                    <td className="p-2">{a.totalStudents}</td>
                                    <td className="p-2">{a.submissionRate}%</td>
                                </tr>
                            )}
                        />
                    )}
                </Panel>

                <Panel title="Students Highlights">
                    {perfLoading ? (
                        <div className="text-sm text-gray-500">Loading…</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium mb-2">Top Performers</h3>
                                <Table<LecturerStudentPerformanceItem>
                                    headers={["Student", "Avg Grade", "Completed", "Late", "Risk"]}
                                    rows={studentsPerf?.data?.topPerformers ?? []}
                                    emptyText="No top performers"
                                    renderRow={(s, i) => (
                                        <tr key={i} className="border-b">
                                            <td className="p-2">
                                                <span className="font-medium">{s.studentName}</span>
                                            </td>
                                            <td className="p-2">{s.averageGrade}</td>
                                            <td className="p-2">
                                                {s.assignmentsCompleted}/{s.assignmentsTotal}
                                            </td>
                                            <td className="p-2">{s.lateSubmissions}</td>
                                            <td className="p-2">{s.riskLevel}</td>
                                        </tr>
                                    )}
                                />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium mb-2">At-Risk Students</h3>
                                <Table<LecturerStudentPerformanceItem>
                                    headers={["Student", "Avg Grade", "Completed", "Late", "Risk"]}
                                    rows={studentsPerf?.data?.atRiskStudents ?? []}
                                    emptyText="No at-risk students"
                                    renderRow={(s, i) => (
                                        <tr key={i} className="border-b">
                                            <td className="p-2">
                                                <span className="font-medium">{s.studentName}</span>
                                            </td>
                                            <td className="p-2">{s.averageGrade}</td>
                                            <td className="p-2">
                                                {s.assignmentsCompleted}/{s.assignmentsTotal}
                                            </td>
                                            <td className="p-2">{s.lateSubmissions}</td>
                                            <td className="p-2">{s.riskLevel}</td>
                                        </tr>
                                    )}
                                />
                            </div>
                        </div>
                    )}
                </Panel>
            </div>

            <Panel title="Assignments Details">
                {statsLoading ? (
                    <div className="text-sm text-gray-500">Loading…</div>
                ) : (
                    <Table<LecturerAssignmentStatisticsItem>
                        headers={[
                            "Assignment",
                            "Topic",
                            "Total Submissions",
                            "Expected",
                            "On-time",
                            "Late",
                            "Avg Grade",
                            "Lowest",
                            "Highest",
                            "Difficulty",
                        ]}
                        rows={assignmentsStats?.data?.assignments ?? []}
                        emptyText="No assignment statistics"
                        renderRow={(a, i) => (
                            <tr key={i} className="border-b">
                                <td className="p-2">
                                    <span className="font-medium">{a.title}</span>
                                </td>
                                <td className="p-2">{a.topicName}</td>
                                <td className="p-2">{a.totalSubmissions}</td>
                                <td className="p-2">{a.expectedSubmissions}</td>
                                <td className="p-2">{a.onTimeSubmissions}</td>
                                <td className="p-2">{a.lateSubmissions}</td>
                                <td className="p-2">{a.averageGrade}</td>
                                <td className="p-2">{a.lowestGrade}</td>
                                <td className="p-2">{a.highestGrade}</td>
                                <td className="p-2">{a.difficultyLevel}</td>
                            </tr>
                        )}
                    />
                )}
            </Panel>

            {/* Helpful links */}
            <div className="flex items-center justify-end gap-3 text-sm">
                <Link href="/lecturer/announcements" className="text-[#000D83] hover:underline">
                    Go to Announcements
                </Link>
                <Link href="/lecturer/course" className="text-[#000D83] hover:underline">
                    Manage Courses
                </Link>
            </div>
        </div>
    );
}

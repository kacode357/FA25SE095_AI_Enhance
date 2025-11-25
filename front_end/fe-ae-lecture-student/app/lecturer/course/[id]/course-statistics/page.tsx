"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCourseStatistics } from "@/hooks/course/useCourseStatistics";
import {
    ArrowLeft,
    Bell,
    ClipboardList,
    LayoutGrid,
    Loader2,
    MessageSquare,
    Sparkles,
    Users
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import MetricTile from "./components/MetricTile";

type StatusInfo = { label: string; className: string };
const STATUS_MAP: Record<number, StatusInfo> = {
    1: { label: "Pending Approval", className: "bg-amber-100 text-amber-700 border border-amber-200" },
    2: { label: "Active", className: "bg-green-100 text-green-700 border border-green-200" },
    3: { label: "Inactive", className: "bg-gray-100 text-gray-600 border border-gray-200" },
    4: { label: "Rejected", className: "bg-rose-100 text-rose-700 border border-rose-200" },
};

export default function CourseStatisticsPage() {
    const { id } = useParams();
    const router = useRouter();
    const search = useSearchParams();
    const incomingTab = search?.get?.("tab");
    const { data, loading, fetchCourseStatistics } = useCourseStatistics();

    // avoid duplicate API calls
    const fetchedFor = useRef<string | null>(null);
    useEffect(() => {
        if (id && typeof id === "string") {
            if (fetchedFor.current !== id) {
                fetchedFor.current = id;
                fetchCourseStatistics(id);
            }
        }
    }, [id, fetchCourseStatistics]);

    const stats = data?.statistics;
    const course = stats?.course;

    const fmtDate = (v?: string | null) => (v ? new Date(v).toLocaleString("en-GB") : "-");

    const enrollmentsByMonthData = useMemo(() => {
        if (!stats?.enrollmentsByMonth) return [];
        return Object.entries(stats.enrollmentsByMonth)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, count]) => ({ month, count }));
    }, [stats?.enrollmentsByMonth]);

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center text-slate-500 gap-2">
                <Loader2 className="size-4 animate-spin" />
                Loading course statistics...
            </div>
        );
    }

    if (!course || !stats) {
        return (
            <div className="p-6 text-center text-slate-500 space-y-4">
                No course found.
                <div className="text-sm">
                    <Button
                    className="btn btn-gradient-slow text-sm"
                    onClick={() => {
                        if (typeof id === "string") {
                            if (incomingTab) {
                                router.push(`/lecturer/course/${id}?tab=${incomingTab}`);
                            } else {
                                router.push(`/lecturer/course/${id}`);
                            }
                        } else {
                            router.push("/lecturer/course");
                        }
                    }}
                    >
                        ← Back
                    </Button>
                </div>
            </div>
        );
    }

    const courseId = String(id);
    const statusInfo: StatusInfo =
        STATUS_MAP[course.status] ?? {
            label: "Unknown",
            className: "bg-gray-100 text-gray-600 border border-gray-200",
        };

    return (
        <div className="h-full flex flex-col">
            {/* Header (fixed) */}
            <div className="flex items-center justify-between -mx-3 px-5 pb-4 mb-2 shadow-md flex-none">
                <div>
                    <h1 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                        {course.courseCode} — {course.courseCodeTitle}
                    </h1>
                    <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                        Lecturer: <b>{course.lecturerName}</b> • Department: {course.department}
                    </p>
                    <div className="mt-5 flex items-center gap-2">
                        <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
                        <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                            Created: {fmtDate(course.createdAt)}
                        </span>
                        {course.approvedAt && (
                            <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                                • Approved: {fmtDate(course.approvedAt)}
                            </span>
                        )}
                    </div>
                </div>
                <Button
                    onClick={() => (typeof id === "string" ? router.push(`/lecturer/course/${id}`) : router.push("/lecturer/course"))}
                    className="rounded-xl text-sm btn btn-gradient-slow"
                >
                    <ArrowLeft className=" size-4" /> Back
                </Button>
            </div>

            {/* Scrollable content */}
            <div className="px-3 py-2 space-y-6 overflow-auto flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <MetricTile
                        href={`/lecturer/course/${courseId}/course-statistics/total-enrollments`}
                        icon={<Users className="size-4" />}
                        label="Total Enrollments"
                        value={stats.totalEnrollments}
                    />
                    <MetricTile
                        href={`/lecturer/course/${courseId}/course-statistics/total-assignments`}
                        icon={<ClipboardList className="size-4" />}
                        label="Total Assignments"
                        value={stats.totalAssignments}
                    />
                    <MetricTile
                        href={`/lecturer/course/${courseId}/course-statistics/total-groups`}
                        icon={<LayoutGrid className="size-4" />}
                        label="Total Groups"
                        value={stats.totalGroups}
                    />
                    <MetricTile
                        href={`/lecturer/course/${courseId}/chat-messages`}
                        icon={<MessageSquare className="size-4" />}
                        label="Chat Messages"
                        value={stats.totalChatMessages}
                    />
                    <MetricTile
                        href={`/lecturer/course/${courseId}/notifications`}
                        icon={<Bell className="size-4" />}
                        label="Notifications"
                        value={stats.totalNotifications}
                    />
                    <MetricTile
                        href={`/lecturer/course/${courseId}/course-statistics/recent-enrollments`}
                        icon={<Sparkles className="size-4" />}
                        label="Recent Enrollments"
                        value={stats.recentEnrollments}
                    />
                </div>

                {/* Activity */}
                <Card className="border card">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base" style={{ color: "var(--foreground)" }}>
                            Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm" style={{ color: "var(--foreground)" }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium">Last activity</div>
                                <div className="text-xs" style={{ color: "var(--color-muted)" }}>
                                    {fmtDate(stats.lastActivity)}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-medium">Current students</div>
                                <div className="text-xs" style={{ color: "var(--color-muted)" }}>
                                    {course.enrollmentCount}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Enrollments by Month chart */}
                <Card className="border card">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base" style={{ color: "var(--foreground)" }}>
                            Enrollments by Month
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {enrollmentsByMonthData.length === 0 ? (
                            <div className="text-sm" style={{ color: "var(--color-muted)" }}>
                                No enrollment data.
                            </div>
                        ) : (
                            <div className="h-72 w-full text-violet-700">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={enrollmentsByMonthData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Bar dataKey="count" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

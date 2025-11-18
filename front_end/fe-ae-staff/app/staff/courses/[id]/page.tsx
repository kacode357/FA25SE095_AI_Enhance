// app/(staff)/staff/manager/courses/[id]/page.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCourseStatistics } from "@/hooks/course/useCourseStatistics";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  ClipboardList,
  LayoutGrid,
  Loader2,
  MessageSquare,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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

type StatusInfo = { label: string; className: string };
const STATUS_MAP: Record<number, StatusInfo> = {
  1: { label: "Pending Approval", className: "bg-amber-100 text-amber-700 border border-amber-200" },
  2: { label: "Active", className: "bg-green-100 text-green-700 border border-green-200" },
  3: { label: "Inactive", className: "bg-gray-100 text-gray-600 border border-gray-200" },
  4: { label: "Rejected", className: "bg-rose-100 text-rose-700 border border-rose-200" },
};

export default function CourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data, loading, fetchCourseStatistics } = useCourseStatistics();

  // tránh gọi API lặp
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
        Đang tải thống kê khóa học...
      </div>
    );
  }

  if (!course || !stats) {
    return (
      <div className="p-6 text-center text-slate-500 space-y-4">
        Không tìm thấy khóa học.
        <div>
          <Button className="btn btn-gradient-slow" onClick={() => router.push("/staff/courses")}>← Back</Button>
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
    <div className="p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--foreground)" }}>
            {course.courseCode} — {course.courseCodeTitle}
          </h1>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            Lecturer: <b>{course.lecturerName}</b> • Department: {course.department}
          </p>
          <div className="mt-2 flex items-center gap-2">
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
        <Button onClick={() => router.push("/staff/courses")} className="rounded-xl btn btn-gradient-slow">
          <ArrowLeft className=" size-4" /> Back
        </Button>
      </div>

      {/* Metric tiles (UI mới – gọn, không gạch xanh) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricTile
          href={`/staff/courses/${courseId}/total-enrollments`}
          icon={<Users className="size-4" />}
          label="Total Enrollments"
          value={stats.totalEnrollments}
        />
        <MetricTile
          href={`/staff/courses/${courseId}/total-assignments`}
          icon={<ClipboardList className="size-4" />}
          label="Total Assignments"
          value={stats.totalAssignments}
        />
        <MetricTile
          href={`/staff/courses/${courseId}/total-groups`}
          icon={<LayoutGrid className="size-4" />}
          label="Total Groups"
          value={stats.totalGroups}
        />
        <MetricTile
          href={`/staff/courses/${courseId}/chat-messages`}
          icon={<MessageSquare className="size-4" />}
          label="Chat Messages"
          value={stats.totalChatMessages}
        />
        <MetricTile
          href={`/staff/courses/${courseId}/notifications`}
          icon={<Bell className="size-4" />}
          label="Notifications"
          value={stats.totalNotifications}
        />
        <MetricTile
          href={`/staff/courses/${courseId}/recent-enrollments`}
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

      {/* Enrollments by Month chart (giữ nguyên) */}
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
            <div className="h-72 w-full">
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
  );
}

function MetricTile({
  href,
  icon,
  label,
  value,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <Link
      href={href}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2 rounded-2xl"
      aria-label={`${label}: ${value}. View details`}
    >
      <Card
        className="border card rounded-2xl transition-all duration-150 hover:shadow-md hover:-translate-y-0.5"
        style={{ borderColor: "var(--color-border)" }}
      >
        <CardContent className="p-4 md:p-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <div
              className="size-9 md:size-10 grid place-items-center rounded-2xl border"
              style={{
                background: "color-mix(in oklab, var(--color-brand) 8%, transparent)",
                borderColor: "color-mix(in oklab, var(--color-brand) 18%, var(--color-border))",
              }}
            >
              {icon}
            </div>
            <span className="text-sm truncate" style={{ color: "var(--color-muted)" }}>
              {label}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
              {value}
            </div>
            <ChevronRight
              className="size-5 opacity-60 transition-transform duration-150 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

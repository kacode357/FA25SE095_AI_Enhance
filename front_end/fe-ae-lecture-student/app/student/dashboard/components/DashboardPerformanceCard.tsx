// app/student/dashboard/components/DashboardPerformanceCard.tsx
"use client";

import { AlertTriangle, TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { StudentPerformanceAnalyticsData } from "@/types/dashboard/dashboard.response";

type Props = {
  data?: StudentPerformanceAnalyticsData;
  loading: boolean;
};

export default function DashboardPerformanceCard({ data, loading }: Props) {
  const coursePerformance = data?.coursePerformance ?? [];

  return (
    <Card className="dashboard-ghost border border-indigo-100 shadow-sm transition duration-200 hover:-translate-y-[2px] hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold text-nav">
          Performance
        </CardTitle>
        <TrendingUp className="h-4 w-4 text-teal-500" />
      </CardHeader>

      <CardContent className="space-y-3">
        {loading || !data ? (
          <PerformanceSkeleton />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <MetricPill
                label="Average grade"
                value={formatNumber(data.averageGrade)}
                tone="default"
              />
              <MetricPill
                label="On-time rate"
                value={`${data.onTimeSubmissionRate ?? 0}%`}
                tone="success"
              />
              <MetricPill
                label="Late rate"
                value={`${data.lateSubmissionRate ?? 0}%`}
                tone="danger"
              />
              <MetricPill
                label="Total submissions"
                value={data.totalSubmissions ?? 0}
                tone="default"
              />
            </div>

            <div className="rounded-lg bg-amber-50 p-2 text-xs text-amber-700">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-4 w-4" />
                Resubmissions: {data.totalResubmissions} (
                {data.resubmissionRate}%)
              </div>
            </div>

            {coursePerformance.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-nav">
                  Course completion
                </p>
                {coursePerformance.slice(0, 3).map((course) => (
                  <div key={course.courseId} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span className="max-w-[70%] truncate">
                        {course.courseName}
                      </span>
                      <span className="font-semibold text-nav">
                        {(course.completionRate ?? 0).toFixed(2)}%
                      </span>
                    </div>
                    <Progress value={course.completionRate ?? 0} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function MetricPill({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "success" | "danger";
}) {
  const toneClasses =
    tone === "success"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "danger"
      ? "bg-rose-50 text-rose-700"
      : "bg-slate-50 text-slate-700";

  return (
    <div className={`rounded-lg p-2 ${toneClasses}`}>
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-nav">{value}</div>
    </div>
  );
}

function PerformanceSkeleton() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return Number.isFinite(value) ? value.toFixed(2) : "—";
}

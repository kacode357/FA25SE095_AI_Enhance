"use client";

import { useRouter } from "next/navigation";
import { BarChart3, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import type { LecturerAssignmentsStatisticsData } from "@/types/dashboard/dashboard.response";

type Props = {
  data?: LecturerAssignmentsStatisticsData;
  loading: boolean;
  courseId?: string;
};

export default function AssignmentsStatisticsCard({ data, loading, courseId }: Props) {
  const router = useRouter();
  const assignments = data?.assignments ?? [];

  const handleGoAssignment = (assignmentId: string) => {
    if (!courseId) return;
    router.push(`/lecturer/course/${courseId}/assignments/${assignmentId}`);
  };

  return (
    <Card className="dashboard-ghost border border-indigo-100 shadow-sm transition duration-200 hover:-translate-y-[2px] hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold text-nav">
          Assignment statistics
        </CardTitle>
        <BarChart3 className="h-4 w-4 text-sky-500" />
      </CardHeader>

      <CardContent className="space-y-3">
        {loading ? (
          <StatsSkeleton />
        ) : !data ? (
          <p className="text-sm text-slate-500">No data loaded.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <SummaryPill
                label="Overall submission rate"
                value={`${formatNumber(data.overallSubmissionRate)}%`}
              />
              <SummaryPill
                label="Average grade"
                value={formatNumber(data.overallAverageGrade)}
              />
            </div>

            <div className="space-y-2">
              {assignments.slice(0, 5).map((assignment) => (
                <div
                  key={assignment.assignmentId}
                  className="cursor-pointer rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs shadow-sm transition hover:-translate-y-[1px] hover:border-indigo-100 hover:shadow-md"
                  onClick={() => handleGoAssignment(assignment.assignmentId)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-nav">{assignment.title}</span>
                      <Badge variant="outline" className="text-[11px]">
                        {assignment.topicName}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-slate-600">
                      {(assignment.submissionRate ?? 0).toFixed(2)}%
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <Progress value={assignment.submissionRate ?? 0} />
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        {assignment.totalSubmissions}/{assignment.expectedSubmissions} submitted
                      </span>
                      <span className="text-slate-400">•</span>
                      <span>On time: {assignment.onTimeSubmissions}</span>
                      <span className="text-slate-400">•</span>
                      <span>Late: {assignment.lateSubmissions}</span>
                    </div>
                  </div>
                </div>
              ))}
              {assignments.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  No assignments found.
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-nav">{value}</div>
    </div>
  );
}

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "N/A";
  return Number.isFinite(value) ? value.toFixed(2) : "N/A";
}

function StatsSkeleton() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 2 }).map((_, idx) => (
          <Skeleton key={idx} className="h-12 w-full" />
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, idx) => (
          <Skeleton key={idx} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

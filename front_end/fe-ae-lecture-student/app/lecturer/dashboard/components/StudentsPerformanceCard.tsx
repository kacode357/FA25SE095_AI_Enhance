"use client";

import type { ReactNode } from "react";
import { Medal, ShieldAlert, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import type { LecturerStudentsPerformanceData } from "@/types/dashboard/dashboard.response";

type Props = {
  data?: LecturerStudentsPerformanceData;
  loading: boolean;
};

export default function StudentsPerformanceCard({ data, loading }: Props) {
  const gradeDistribution = data?.gradeDistribution;
  const topPerformers = data?.topPerformers ?? [];
  const atRiskStudents = data?.atRiskStudents ?? [];

  return (
    <Card className="dashboard-ghost border border-indigo-100 shadow-sm transition duration-200 hover:-translate-y-[2px] hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold text-nav">
          Students performance
        </CardTitle>
        <Sparkles className="h-4 w-4 text-violet-500" />
      </CardHeader>

      <CardContent className="space-y-3">
        {loading ? (
          <PerformanceSkeleton />
        ) : !data ? (
          <p className="text-sm text-slate-500">No data loaded.</p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <InfoPill label="Avg grade" value={formatNumber(data.averageCourseGrade)} />
              <InfoPill label="Submission rate" value={`${formatNumber(data.submissionRate)}%`} />
              <InfoPill label="Total students" value={data.totalStudents} />
            </div>

            {gradeDistribution ? (
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs">
                <div className="mb-2 text-[11px] font-semibold text-nav">
                  Grade distribution
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    ["A", gradeDistribution.aCount],
                    ["B", gradeDistribution.bCount],
                    ["C", gradeDistribution.cCount],
                    ["D", gradeDistribution.dCount],
                    ["F", gradeDistribution.fCount],
                    ["Ungraded", gradeDistribution.ungradeCount],
                  ] as const).map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded border border-slate-100 bg-white px-2 py-1.5"
                    >
                      <span className="text-slate-700">{label}</span>
                      <span className="font-semibold text-nav">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-2">
              <ListCard title="Top performers" icon={<Medal className="h-4 w-4 text-amber-500" />}>
                {topPerformers.slice(0, 3).map((student) => (
                  <StudentRow
                    key={student.studentId}
                    name={student.studentName}
                    grade={student.averageGrade}
                    completed={student.assignmentsCompleted}
                    total={student.assignmentsTotal}
                  />
                ))}
                {topPerformers.length === 0 && (
                  <EmptyRow label="No performers yet." />
                )}
              </ListCard>

              <ListCard title="At risk" icon={<ShieldAlert className="h-4 w-4 text-rose-500" />}>
                {atRiskStudents.slice(0, 3).map((student) => (
                  <StudentRow
                    key={student.studentId}
                    name={student.studentName}
                    grade={student.averageGrade}
                    completed={student.assignmentsCompleted}
                    total={student.assignmentsTotal}
                    risk={student.riskLevel}
                  />
                ))}
                {atRiskStudents.length === 0 && <EmptyRow label="No risks detected." />}
              </ListCard>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function InfoPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-nav">{value}</div>
    </div>
  );
}

function ListCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-nav">
        {icon}
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function StudentRow({
  name,
  grade,
  completed,
  total,
  risk,
}: {
  name: string;
  grade: number;
  completed: number;
  total: number;
  risk?: string;
}) {
  const completion = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-1 rounded border border-slate-100 bg-white px-2 py-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-nav">{name}</span>
        <Badge variant="outline" className="text-[11px]">
          {formatNumber(grade)}
        </Badge>
      </div>
      <Progress value={completion} className="h-2" />
      <div className="flex items-center justify-between text-[11px] text-slate-600">
        <span>
          {completed}/{total} done
        </span>
        {risk ? <span className="text-rose-500">{risk}</span> : null}
      </div>
    </div>
  );
}

function EmptyRow({ label }: { label: string }) {
  return (
    <div className="rounded border border-dashed border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-500">
      {label}
    </div>
  );
}

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "N/A";
  return Number.isFinite(value) ? value.toFixed(2) : "N/A";
}

function PerformanceSkeleton() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 3 }).map((_, idx) => (
          <Skeleton key={idx} className="h-12 w-full" />
        ))}
      </div>
      <Skeleton className="h-24 w-full" />
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 2 }).map((_, idx) => (
          <Skeleton key={idx} className="h-24 w-full" />
        ))}
      </div>
    </div>
  );
}

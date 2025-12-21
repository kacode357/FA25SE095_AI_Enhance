// app/student/dashboard/components/DashboardOverviewCard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";

import type { StudentGradesOverviewData } from "@/types/dashboard/dashboard.response";

type Props = {
  data?: StudentGradesOverviewData;
  loading: boolean;
};

export default function DashboardOverviewCard({ data, loading }: Props) {
  const currentTermGpa = data?.currentTermGpa;
  const overallGpa = data?.overallGpa;

  return (
    <Card className="dashboard-ghost border border-indigo-100 shadow-sm transition duration-200 hover:-translate-y-[2px] hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold text-nav">
          GPA Overview
        </CardTitle>
        <TrendingUp className="h-4 w-4 text-indigo-500" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <OverviewSkeleton />
        ) : (
          <>
            <div className="flex items-end gap-8">
              <NumberBlock
                label="Current term GPA"
                value={formatNumber(currentTermGpa)}
                accent
              />
              <NumberBlock label="Overall GPA" value={formatNumber(overallGpa)} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              {/* <StatPill
                label="Weight earned"
                value={`${data?.totalWeightEarned ?? 0} / ${
                  data?.totalWeightPossible ?? 0
                }`}
              /> */}
              <StatPill label="Courses" value={data?.courses.length ?? 0} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function NumberBlock({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-slate-600">{label}</p>
      <p
        className={`whitespace-nowrap text-2xl font-bold ${
          accent ? "text-nav" : "text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-slate-50 p-2">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="font-semibold text-nav">{value}</div>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-end gap-8">
        <Skeleton className="h-12 w-24" />
        <Skeleton className="h-10 w-20" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return Number.isFinite(value) ? value.toFixed(2) : "—";
}

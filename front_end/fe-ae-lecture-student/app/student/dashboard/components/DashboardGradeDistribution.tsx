// app/student/dashboard/components/DashboardGradeDistribution.tsx
"use client";

import { BookOpen } from "lucide-react";
import {
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { GradeDistributionDto } from "@/types/dashboard/dashboard.response";

const palette = ["#10b981", "#3b82f6", "#6366f1", "#f59e0b", "#ef4444", "#94a3b8"];

type Props = {
  distribution?: GradeDistributionDto;
  loading: boolean;
};

export default function DashboardGradeDistribution({
  distribution,
  loading,
}: Props) {
  const chartData = distribution
    ? [
        { label: "A", value: distribution.aCount },
        { label: "B", value: distribution.bCount },
        { label: "C", value: distribution.cCount },
        { label: "D", value: distribution.dCount },
        { label: "F", value: distribution.fCount },
        { label: "Ungraded", value: distribution.ungradeCount },
      ].filter((item) => item.value > 0)
    : [];

  const total =
    (distribution?.aCount ?? 0) +
    (distribution?.bCount ?? 0) +
    (distribution?.cCount ?? 0) +
    (distribution?.dCount ?? 0) +
    (distribution?.fCount ?? 0) +
    (distribution?.ungradeCount ?? 0);

  return (
    <Card className="dashboard-ghost border border-indigo-100 shadow-sm transition duration-200 hover:-translate-y-[2px] hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold text-nav">
          Grade Distribution
        </CardTitle>
        <BookOpen className="h-4 w-4 text-purple-500" />
      </CardHeader>

      <CardContent>
        {loading ? (
          <DistributionSkeleton />
        ) : !distribution ? (
          <p className="text-sm text-slate-500">No data.</p>
        ) : (
          <div className="flex items-center gap-4">
            <div className="h-40 w-40">
              {chartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  No grades yet
                </div>
              ) : (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="label"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={2}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={entry.label}
                          fill={palette[index % palette.length]}
                          stroke="transparent"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value}`, "Count"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="grid flex-1 grid-cols-2 gap-2 text-xs">
              {[
                ["A", distribution.aCount],
                ["B", distribution.bCount],
                ["C", distribution.cCount],
                ["D", distribution.dCount],
                ["F", distribution.fCount],
                ["Ungraded", distribution.ungradeCount],
              ].map(([label, value], idx) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded border border-slate-100 bg-slate-50 px-2 py-1.5"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: palette[idx % palette.length] }}
                    />
                    <span className="text-slate-700">{label}</span>
                  </span>
                  <span className="font-semibold text-nav">{value}</span>
                </div>
              ))}
              <div className="col-span-2 rounded border border-indigo-100 bg-indigo-50 px-3 py-2 text-[11px] font-semibold text-nav">
                Total courses: {total}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DistributionSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="h-40 w-40 rounded-full" />
      <div className="grid flex-1 grid-cols-2 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    </div>
  );
}

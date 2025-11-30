"use client";

import { useEffect } from "react";
import { BookOpen } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useStudentGradesOverview } from "@/hooks/dashboard/useStudentGradesOverview";
import type { GradeDistributionDto } from "@/types/dashboard/dashboard.response";

export default function DashboardGradeDistribution({ termId }: { termId?: string }) {
  const { data, loading, fetchOverview } = useStudentGradesOverview();

  useEffect(() => {
    fetchOverview(termId);
  }, [termId]);

  const g = data?.data.gradeDistribution;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Grade Distribution</CardTitle>
        <BookOpen className="h-4 w-4 text-purple-500" />
      </CardHeader>

      <CardContent>
        {loading || !g ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              ["A", "aCount", "bg-emerald-50", "text-emerald-700"],
              ["B", "bCount", "bg-blue-50", "text-blue-700"],
              ["C", "cCount", "bg-indigo-50", "text-indigo-700"],
              ["D", "dCount", "bg-amber-50", "text-amber-700"],
              ["F", "fCount", "bg-rose-50", "text-rose-700"],
              ["Ungraded", "ungradeCount", "bg-slate-50", "text-slate-700"],
            ].map(([label, key, bg, color]) => {
              const typedKey = key as keyof GradeDistributionDto;

              return (
                <div key={label} className={`rounded p-2 ${bg}`}>
                  <div className={`text-[11px] ${color}`}>{label}</div>
                  <div className="text-sm font-semibold text-slate-900">
                    {g[typedKey]}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

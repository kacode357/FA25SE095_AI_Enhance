"use client";

import { useEffect } from "react";
import { TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useStudentGradesOverview } from "@/hooks/dashboard/useStudentGradesOverview";

export default function DashboardOverviewCard({ termId }: { termId?: string }) {
  const { data, loading, fetchOverview } = useStudentGradesOverview();

  useEffect(() => {
    fetchOverview(termId);
  }, [termId]);

  const d = data?.data;

  return (
    <Card className="border-indigo-100">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">GPA Overview</CardTitle>
        <TrendingUp className="h-4 w-4 text-indigo-500" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-slate-500">Loading...</div>
        ) : (
          <>
            <div className="flex items-end gap-8">
              <div>
                <p className="text-xs text-slate-600">Current Term GPA</p>
                <p className="text-2xl font-bold">{d?.currentTermGpa ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600">Overall GPA</p>
                <p className="text-xl font-semibold">{d?.overallGpa ?? "—"}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded bg-slate-50 p-2">
                <div className="text-[11px] text-slate-500">Weight Earned</div>
                <div className="font-semibold">
                  {d?.totalWeightEarned ?? 0} / {d?.totalWeightPossible ?? 0}
                </div>
              </div>

              <div className="rounded bg-slate-50 p-2">
                <div className="text-[11px] text-slate-500">Courses</div>
                <div className="font-semibold">{d?.courses.length ?? 0}</div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

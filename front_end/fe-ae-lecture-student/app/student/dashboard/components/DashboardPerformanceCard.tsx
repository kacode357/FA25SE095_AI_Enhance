"use client";

import { useEffect } from "react";
import { TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useStudentPerformanceAnalytics } from "@/hooks/dashboard/useStudentPerformanceAnalytics";

export default function DashboardPerformanceCard({ termId }: { termId?: string }) {
  const { data, loading, fetchAnalytics } = useStudentPerformanceAnalytics();

  useEffect(() => {
    fetchAnalytics(termId);
  }, [termId]);

  const a = data?.data;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Performance</CardTitle>
        <TrendingUp className="h-4 w-4 text-teal-500" />
      </CardHeader>

      <CardContent>
        {loading || !a ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded bg-slate-50 p-2">
                <div className="text-[11px] text-slate-500">Average Grade</div>
                <div className="text-sm font-bold">{a.averageGrade}</div>
              </div>

              <div className="rounded bg-slate-50 p-2">
                <div className="text-[11px] text-slate-500">On-time Rate</div>
                <div className="text-sm font-semibold text-emerald-600">{a.onTimeSubmissionRate}%</div>
              </div>

              <div className="rounded bg-slate-50 p-2">
                <div className="text-[11px] text-slate-500">Late Rate</div>
                <div className="text-sm font-semibold text-rose-600">{a.lateSubmissionRate}%</div>
              </div>

              <div className="rounded bg-slate-50 p-2">
                <div className="text-[11px] text-slate-500">Total Submissions</div>
                <div className="text-sm font-semibold">{a.totalSubmissions}</div>
              </div>
            </div>

            <div className="mt-4 rounded bg-amber-50 p-2 text-xs">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertTriangle className="h-4 w-4" />
                Resubmissions: {a.totalResubmissions} ({a.resubmissionRate}%)
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

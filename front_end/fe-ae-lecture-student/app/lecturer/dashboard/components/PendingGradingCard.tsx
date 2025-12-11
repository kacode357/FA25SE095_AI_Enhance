"use client";

import { useRouter } from "next/navigation";
import { Clock3, FileCheck2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import type { LecturerPendingGradingData } from "@/types/dashboard/dashboard.response";

type Props = {
  data?: LecturerPendingGradingData;
  loading: boolean;
  courseId?: string;
};

export default function PendingGradingCard({ data, loading, courseId }: Props) {
  const router = useRouter();
  const pendingReports = data?.pendingReports ?? [];

  const handleGoReport = (reportId: string) => {
    if (!courseId) return;
    router.push(`/lecturer/course/${courseId}/reports/${reportId}`);
  };

  return (
    <Card className="dashboard-ghost border border-indigo-100 shadow-sm transition duration-200 hover:-translate-y-[2px] hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold text-nav">
          Pending grading
        </CardTitle>
        <Clock3 className="h-4 w-4 text-amber-500" />
      </CardHeader>

      <CardContent className="space-y-3">
        {loading ? (
          <PendingSkeleton />
        ) : !data ? (
          <p className="text-sm text-slate-500">No data loaded.</p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <StatBox label="Pending" value={data.totalPending} />
              <StatBox label="Submitted" value={data.submittedCount} />
              <StatBox label="Re-submitted" value={data.resubmittedCount} />
            </div>

            <div className="space-y-2">
              {pendingReports.slice(0, 5).map((report) => (
                <div
                  key={report.reportId}
                  className="cursor-pointer rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs shadow-sm transition hover:-translate-y-[1px] hover:border-indigo-100 hover:shadow-md"
                  onClick={() => handleGoReport(report.reportId)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-nav">
                          {report.assignmentTitle}
                        </span>
                        <Badge variant="outline" className="text-[11px]">
                          {report.courseName}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
                        <span className="flex items-center gap-1">
                          <Clock3 className="h-3.5 w-3.5 text-amber-500" />
                          {formatSubmittedAt(report.submittedAt)} ago
                        </span>
                        <span className="text-slate-400">•</span>
                        <span>By {report.submitterName}</span>
                        {report.isGroupSubmission && report.groupName ? (
                          <>
                            <span className="text-slate-400">•</span>
                            <span>Group {report.groupName}</span>
                          </>
                        ) : null}
                      </div>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                      v{report.version}
                    </Badge>
                  </div>
                </div>
              ))}
              {pendingReports.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  No pending reports.
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="flex items-center gap-1 text-sm font-semibold text-nav">
        <FileCheck2 className="h-4 w-4 text-slate-400" />
        {value}
      </div>
    </div>
  );
}

function formatSubmittedAt(value: string) {
  const submittedDate = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - submittedDate.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours <= 0) return "Just now";
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}

function PendingSkeleton() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 3 }).map((_, idx) => (
          <Skeleton key={idx} className="h-12 w-full" />
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, idx) => (
          <Skeleton key={idx} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}

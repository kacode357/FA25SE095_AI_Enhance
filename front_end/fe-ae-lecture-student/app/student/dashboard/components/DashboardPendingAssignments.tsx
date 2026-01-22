// app/student/dashboard/components/DashboardPendingAssignments.tsx
"use client";

import { useEffect, useCallback } from "react";
import { Clock, ListChecks } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

import { useStudentPendingAssignments } from "@/hooks/dashboard/useStudentPendingAssignments";
import { formatDateOnlyVN } from "@/utils/datetime/format-datetime";

interface DashboardPendingAssignmentsProps {
  termId?: string;
}

export default function DashboardPendingAssignments({ termId }: DashboardPendingAssignmentsProps) {
  const { data, loading, fetchPendingAssignments } =
    useStudentPendingAssignments();
  const router = useRouter();

  useEffect(() => {
    if (!termId) return;
    fetchPendingAssignments(termId);
  }, [termId]);

  const pending = data?.data;

  const handleGoAssignment = useCallback(
    (assignmentId: string, courseId?: string) => {
      if (courseId) {
        router.push(
          `/student/courses/${courseId}/assignments/${assignmentId}`,
        );
        return;
      }
      router.push("/student/my-assignments");
    },
    [router],
  );

  return (
    <Card className="dashboard-ghost border border-indigo-100 shadow-sm transition duration-200 hover:-translate-y-[2px] hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold text-nav">
          Pending Assignments
        </CardTitle>
        <ListChecks className="h-4 w-4 text-indigo-500" />
      </CardHeader>

      <CardContent>
        {loading || !pending ? (
          <PendingSkeleton />
        ) : pending.totalPending === 0 ? (
          <p className="text-sm text-slate-500">No pending assignments.</p>
        ) : (
          <div className="space-y-2">
            {pending.upcomingAssignments.slice(0, 4).map((a) => (
              <div
                key={a.assignmentId}
                role="button"
                tabIndex={0}
                onClick={() => handleGoAssignment(a.assignmentId, a.courseId)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleGoAssignment(a.assignmentId, a.courseId);
                  }
                }}
                className="cursor-pointer rounded border border-indigo-100 bg-white/80 px-3 py-2 text-xs shadow-sm transition hover:-translate-y-[1px] hover:border-indigo-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <div className="flex justify-between gap-2">
                  <span className="line-clamp-1 font-semibold text-nav">
                    {a.title}
                  </span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDateOnlyVN(a.dueDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold text-indigo-700">
                    {a.courseName}
                  </span>
                  <span className="text-xs text-slate-500">{a.topicName}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PendingSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}

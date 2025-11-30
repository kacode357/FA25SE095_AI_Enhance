"use client";

import { useEffect } from "react";
import { Clock, ListChecks } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useStudentPendingAssignments } from "@/hooks/dashboard/useStudentPendingAssignments";
import { formatDateOnlyVN } from "@/utils/datetime/format-datetime";

export default function DashboardPendingAssignments() {
  const { data, loading, fetchPendingAssignments } =
    useStudentPendingAssignments();

  useEffect(() => {
    fetchPendingAssignments();
  }, []);

  const d = data?.data;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
        <ListChecks className="h-4 w-4 text-indigo-500" />
      </CardHeader>

      <CardContent>
        {loading || !d ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : d.totalPending === 0 ? (
          <p className="text-sm text-slate-500">No pending assignments 🎉</p>
        ) : (
          <div className="space-y-2">
            {d.upcomingAssignments.slice(0, 4).map((a) => (
              <div
                key={a.assignmentId}
                className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
              >
                <div className="flex justify-between">
                  <span className="font-medium">{a.title}</span>
                  <span className="text-slate-600">
                    {formatDateOnlyVN(a.dueDate)}
                  </span>
                </div>
                <div className="text-slate-500">
                  {a.courseName} • {a.topicName}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

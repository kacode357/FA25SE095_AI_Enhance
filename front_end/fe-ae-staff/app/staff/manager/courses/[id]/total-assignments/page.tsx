// app/(staff)/staff/manager/courses/[id]/total-assignments/page.tsx
"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Loader2, CalendarDays, Users2, Eye } from "lucide-react";
import { useAssignments } from "@/hooks/assignment/useAssignments";

export default function TotalAssignmentsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { listData, loading, fetchAssignments, reset } = useAssignments();

  const fetchedFor = useRef<string | null>(null);
  useEffect(() => {
    const courseId = typeof id === "string" ? id : "";
    if (!courseId) return;

    if (fetchedFor.current !== courseId) {
      fetchedFor.current = courseId;
      fetchAssignments({
        courseId,
        pageNumber: 1,
        pageSize: 50,
        sortBy: "DueDate",
        sortOrder: "asc",
      });
    }
    return () => reset();
  }, [id, fetchAssignments, reset]);

  const total = listData?.totalCount ?? 0;

  const items = useMemo(() => {
    return (listData?.assignments ?? []).map((a) => ({
      id: a.id,
      title: a.title,
      dueDate: a.dueDate,
      extendedDueDate: a.extendedDueDate,
      status: a.status,
      statusDisplay: a.statusDisplay,
      isGroup: a.isGroupAssignment,
      daysUntilDue: a.daysUntilDue,
      isOverdue: a.isOverdue,
      createdAt: a.createdAt,
      assignedGroupsCount: a.assignedGroupsCount,
      maxPoints: a.maxPoints,
    }));
  }, [listData?.assignments]);

  const fmtDate = (v?: string | null) => (v ? new Date(v).toLocaleString("en-GB") : "-");

  const statusClass = (status: number, isOverdue: boolean) => {
    if (isOverdue) return "bg-rose-100 text-rose-700 border border-rose-200";
    switch (status) {
      case 0: return "bg-gray-100 text-gray-700 border border-gray-200";      // Draft
      case 1: return "bg-green-100 text-green-700 border border-green-200";    // Active
      case 2: return "bg-sky-100 text-sky-700 border border-sky-200";          // Extended
      case 3: return "bg-rose-100 text-rose-700 border border-rose-200";       // Overdue
      case 4: return "bg-slate-100 text-slate-700 border border-slate-200";    // Closed
      default: return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
          Assignments ({total})
        </h1>
        <Button onClick={() => router.push(`/staff/manager/courses/${id}`)} className="rounded-xl">
          ← Back
        </Button>
      </div>

      {/* Summary card */}
      <Card className="border card rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base" style={{ color: "var(--foreground)" }}>
            Total Assignments
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3" style={{ color: "var(--color-muted)" }}>
            <div
              className="p-2 rounded-2xl border"
              style={{
                background: "color-mix(in oklab, var(--color-brand) 8%, transparent)",
                borderColor: "color-mix(in oklab, var(--color-brand) 18%, var(--color-border))",
              }}
            >
              <ClipboardList className="size-5" />
            </div>
            <span className="text-sm">Assignments</span>
          </div>
          <div className="min-w-[3rem] flex items-center justify-end">
            {loading ? (
              <Loader2 className="size-5 animate-spin opacity-70" />
            ) : (
              <div className="text-3xl font-bold" style={{ color: "var(--foreground)" }}>
                {total}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="border card rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base" style={{ color: "var(--foreground)" }}>
            Assignment List
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 flex items-center gap-2" style={{ color: "var(--color-muted)" }}>
              <Loader2 className="size-4 animate-spin" /> Loading assignments...
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-sm" style={{ color: "var(--color-muted)" }}>
              No assignments found.
            </div>
          ) : (
            <ul className="divide-y" style={{ borderColor: "var(--color-border)" }}>
              {items.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-4 p-4"
                  style={{ color: "var(--foreground)" }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="size-9 grid place-items-center rounded-2xl border shrink-0"
                      style={{
                        background: "color-mix(in oklab, var(--color-brand) 8%, transparent)",
                        borderColor:
                          "color-mix(in oklab, var(--color-brand) 18%, var(--color-border))",
                      }}
                    >
                      <ClipboardList className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{a.title}</div>
                      <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: "var(--color-muted)" }}>
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="size-3.5" />
                          Due: {fmtDate(a.extendedDueDate || a.dueDate)}
                        </span>
                        {a.isGroup && (
                          <span className="inline-flex items-center gap-1">
                            <Users2 className="size-3.5" /> Groups • {a.assignedGroupsCount}
                          </span>
                        )}
                        <span>Pts: {a.maxPoints}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: View detail */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/staff/manager/courses/${id}/total-assignments/${a.id}`}>
                      <Button className="rounded-xl" variant="outline">
                        <Eye className="mr-2 size-4" />
                        View detail
                      </Button>
                    </Link>

                    <Badge className={statusClass(a.status, a.isOverdue)}>
                      {a.statusDisplay || (a.isOverdue ? "Overdue" : "Status")}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// app/student/courses/[id]/assignments/page.tsx
"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  ListTodo,
  Users,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useMyAssignments } from "@/hooks/assignment/useMyAssignments";
import { AssignmentStatus } from "@/config/classroom-service/assignment-status.enum";

/** Safe parse datetime */
const toDate = (s?: string | null) => {
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

/** Map enum -> CSS class (match app/styles/assignment-status.css) */
const getStatusClass = (s: AssignmentStatus) => {
  switch (s) {
    case AssignmentStatus.Draft:
      return "badge-assignment badge-assignment--draft";
    case AssignmentStatus.Scheduled:
      return "badge-assignment badge-assignment--scheduled";
    case AssignmentStatus.Active:
      return "badge-assignment badge-assignment--active";
    case AssignmentStatus.Extended:
      return "badge-assignment badge-assignment--extended";
    case AssignmentStatus.Overdue:
      return "badge-assignment badge-assignment--overdue";
    case AssignmentStatus.Closed:
      return "badge-assignment badge-assignment--closed";
    case AssignmentStatus.Graded:
      return "badge-assignment badge-assignment--graded";
    default:
      return "badge-assignment badge-assignment--closed";
  }
};

export default function CourseAssignmentsPage() {
  const { id } = useParams();
  const router = useRouter();
  const courseId = typeof id === "string" ? id : "";

  const { listData, loading, fetchMyAssignments } = useMyAssignments();
  const didFetchRef = useRef(false);

  const loadAll = () => {
    if (!courseId) return;
    fetchMyAssignments({
      courseId,
      sortBy: "DueDate",
      sortOrder: "asc",
      pageNumber: 1,
      pageSize: 20,
    });
  };

  useEffect(() => {
    if (!courseId) return;
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const assignments = listData?.assignments ?? [];
  const totalAssignments = listData?.totalCount ?? 0;

  if (!courseId) {
    return (
      <div className="py-16 text-center text-muted">
        <p>
          Không tìm thấy <b>courseId</b> trong URL.
        </p>
        <Button
          className="mt-4 border border-brand text-brand bg-card"
          onClick={() => router.push("/student/my-courses")}
          variant="outline"
        >
          Back to My Courses
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col gap-6 py-6"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-nav">
          <ListTodo className="w-6 h-6 text-brand" />
          <span>Assignments</span>
          {totalAssignments > 0 && (
            <span className="ml-1 text-xs font-medium text-muted">
              ({totalAssignments})
            </span>
          )}
        </h1>

        <Button
          variant="outline"
          onClick={() => router.push(`/student/courses/${courseId}`)}
          className="border-brand text-brand hover:bg-brand/5"
        >
          Back to Course
        </Button>
      </div>

      <Card className="card rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-nav">
            <ListTodo className="w-5 h-5 text-brand" />
            <span>My assignments</span>
          </CardTitle>

          <div className="flex items-center gap-2">
            {/* All */}
            <button
              className="btn h-9 px-3 text-sm border border-border bg-card hover:bg-muted"
              onClick={loadAll}
              title="All assignments"
            >
              All
            </button>

            {/* Upcoming */}
            <button
              className="btn btn-green-slow h-9 px-3 text-sm"
              onClick={() =>
                fetchMyAssignments({
                  courseId,
                  sortBy: "DueDate",
                  sortOrder: "asc",
                  pageNumber: 1,
                  pageSize: 20,
                  isUpcoming: true,
                })
              }
              title="Upcoming"
            >
              <Clock className="w-4 h-4" />
              <span className="text-sm">Upcoming</span>
            </button>

            {/* Overdue */}
            <button
              className="btn btn-yellow-slow h-9 px-3 text-sm"
              onClick={() =>
                fetchMyAssignments({
                  courseId,
                  sortBy: "DueDate",
                  sortOrder: "asc",
                  pageNumber: 1,
                  pageSize: 20,
                  isOverdue: true,
                })
              }
              title="Overdue"
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">Overdue</span>
            </button>
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          {loading ? (
            <div className="py-10 text-center text-muted">
              Loading assignments…
            </div>
          ) : assignments.length === 0 ? (
            <div className="py-10 text-center text-muted">
              You don&apos;t have any assignments yet.
            </div>
          ) : (
            <ul
              className="divide-y"
              style={{ borderColor: "var(--border)" }}
            >
              {assignments.map((a) => {
                const due = toDate(a.dueDate);
                const extended = toDate(a.extendedDueDate);
                const finalDue = extended ?? due;
                const dueLabel = extended ? "Extended due" : "Due";
                const href = `/student/courses/${courseId}/assignments/${a.id}`;

                const showDaysLeft =
                  !a.isOverdue && typeof a.daysUntilDue === "number";

                return (
                  <li key={a.id} className="py-4">
                    <div className="flex flex-col gap-2">
                      {/* Row 1: title + status + group  |  days left / overdue */}
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <Link
                            href={href}
                            className="font-bold text-lg no-underline hover:underline text-nav-active"
                          >
                            {a.title}
                          </Link>

                          <span
                            className={getStatusClass(a.status as AssignmentStatus)}
                            title={a.statusDisplay}
                          >
                            {a.status === AssignmentStatus.Active && (
                              <CheckCircle2 className="w-3 h-3" />
                            )}
                            {a.statusDisplay}
                          </span>

                          {a.isGroupAssignment && (
                            <span className="badge-assignment badge-assignment--group">
                              <Users className="w-3 h-3" />
                              Group
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          {a.isOverdue && (
                            <span className="flex items-center gap-1 text-[#b91c1c] font-medium">
                              <AlertTriangle className="w-4 h-4" />
                              Overdue
                            </span>
                          )}
                          {showDaysLeft && a.daysUntilDue >= 0 && (
                            <span className="font-semibold text-brand">
                              {a.daysUntilDue} day
                              {a.daysUntilDue === 1 ? "" : "s"} left
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Row 2: meta info */}
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted">
                        {finalDue && (
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-4 h-4 text-brand" />
                            {dueLabel}:{" "}
                            <b className="ml-1 text-nav">
                              {finalDue.toLocaleString("en-GB")}
                            </b>
                          </span>
                        )}

                        {typeof a.maxPoints === "number" && (
                          <span>
                            Points:{" "}
                            <b className="text-nav">{a.maxPoints}</b>
                          </span>
                        )}

                        {typeof a.assignedGroupsCount === "number" &&
                          a.isGroupAssignment && (
                            <span>
                              Groups:{" "}
                              <b className="text-nav">
                                {a.assignedGroupsCount}
                              </b>
                            </span>
                          )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// app/student/courses/[id]/assignments/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ListTodo, CalendarDays } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { useMyAssignments } from "@/hooks/assignment/useMyAssignments";
import { AssignmentStatus } from "@/config/classroom-service/assignment-status.enum";
// Đã xóa import parseCourseName

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

  // 1. Fetch data
  useEffect(() => {
    if (!courseId) return;
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    fetchMyAssignments({
      courseId,
      sortBy: "DueDate",
      sortOrder: "asc",
      pageNumber: 1,
      pageSize: 20,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const assignments = listData?.assignments ?? [];
  const totalAssignments = listData?.totalCount ?? 0;

  // 2. Logic courseInfo đã bị xóa theo yêu cầu

  // 3. Group by Topic
  const topics = useMemo(() => {
    const map = new Map<
      string,
      {
        topicKey: string;
        topicName: string;
        items: typeof assignments;
      }
    >();

    for (const a of assignments) {
      const rawTopicName = (a as any).topicName as string | undefined;
      const topicName =
        rawTopicName && rawTopicName.trim().length > 0
          ? rawTopicName
          : "Other";

      const topicKey = topicName;

      if (!map.has(topicKey)) {
        map.set(topicKey, {
          topicKey,
          topicName,
          items: [],
        });
      }
      map.get(topicKey)!.items.push(a);
    }

    return Array.from(map.values());
  }, [assignments]);

  // 4. State quản lý đóng/mở
  const [openTopics, setOpenTopics] = useState<string[]>([]);

  // ==> TỰ ĐỘNG EXPAND ALL KHI CÓ DATA <==
  useEffect(() => {
    if (topics.length > 0) {
      // Lấy hết topicKey set vào state -> mở tất cả
      setOpenTopics(topics.map((t) => t.topicKey));
    }
  }, [topics]);

  const handleToggleAll = () => {
    if (openTopics.length === 0) {
      // currently all collapsed -> expand all
      setOpenTopics(topics.map((t) => t.topicKey));
    } else {
      // some open -> collapse all
      setOpenTopics([]);
    }
  };

  const buttonLabel = openTopics.length === 0 ? "Expand all" : "Collapse all";

  // 5. Render States
  if (!courseId) {
    return (
      <div className="py-16 text-center text-muted">
        <p>
          Cannot find <b>courseId</b> in URL.
        </p>
        <button
          type="button"
          className="mt-4 inline-flex items-center rounded-md border px-4 py-2 text-sm"
          onClick={() => router.push("/student/my-courses")}
        >
          Back to My Courses
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col gap-4 py-6"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-nav">
            <ListTodo className="w-6 h-6 text-brand" />
            <span>Assignments</span>
            {totalAssignments > 0 && (
              <span className="ml-1 text-xs font-medium text-muted">
                ({totalAssignments})
              </span>
            )}
          </h1>

          {/* Phần hiển thị chi tiết Course Info đã bị xóa */}
        </div>
      </div>

      {/* Collapse all / Expand all */}
      {!loading && assignments.length > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            className="text-xs font-semibold text-nav hover:text-brand cursor-pointer"
            onClick={handleToggleAll}
          >
            {buttonLabel}
          </button>
        </div>
      )}

      {/* Assignments by topic */}
      {loading ? (
        <div className="py-10 text-center text-muted text-sm">
          Loading assignments…
        </div>
      ) : assignments.length === 0 ? (
        <div className="py-10 text-center text-muted text-sm">
          You don&apos;t have any assignments yet.
        </div>
      ) : (
        <Accordion
          type="multiple"
          value={openTopics}
          onValueChange={(v) => setOpenTopics(v as string[])}
          className="space-y-4"
        >
          {topics.map((topic) => (
            <AccordionItem
              key={topic.topicKey}
              value={topic.topicKey}
              className="rounded-2xl bg-card shadow-sm border border-gray-200 overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-4 text-left bg-white flex items-center justify-between gap-2 hover:no-underline cursor-pointer border-b border-gray-100">
                <span className="text-base font-semibold text-nav">
                  {topic.topicName}
                </span>
              </AccordionTrigger>

              <AccordionContent className="px-4 pb-4 pt-4">
                <ul className="space-y-2">
                  {topic.items.map((a) => {
                    const href = `/student/courses/${courseId}/assignments/${a.id}`;

                    const dueLabel = a.dueDate
                      ? new Date(a.dueDate).toLocaleString("en-GB", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—";

                    const showDaysLeft =
                      !a.isOverdue && typeof a.daysUntilDue === "number";

                    return (
                      <li key={a.id}>
                        <Link
                          href={href}
                          className="flex flex-col gap-2 no-underline rounded-xl px-2 py-2 hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                          {/* Row 1: title (left) + status (right) */}
                          <div className="flex items-center justify-between gap-4 flex-wrap">
                            <span className="font-medium text-nav">
                              {a.title}
                            </span>
                            <span
                              className={getStatusClass(
                                a.status as AssignmentStatus
                              )}
                            >
                              {a.statusDisplay}
                            </span>
                          </div>

                          {/* Row 2: left meta (type, points, overdue, days) + right due time */}
                          <div className="flex items-center justify-between gap-4 flex-wrap text-xs text-muted">
                            {/* Left meta */}
                            <div className="flex flex-wrap items-center gap-3">
                              <span>
                                Type:{" "}
                                <b className="text-nav">
                                  {a.isGroupAssignment
                                    ? "Group assignment"
                                    : "Individual assignment"}
                                </b>
                              </span>

                              {typeof a.maxPoints === "number" && (
                                <span>
                                  Max points:{" "}
                                  <b className="text-nav">{a.maxPoints}</b>
                                </span>
                              )}

                              {a.isOverdue && (
                                <span className="text-[#b91c1c] font-medium">
                                  Overdue
                                </span>
                              )}

                              {showDaysLeft && a.daysUntilDue >= 0 && (
                                <span className="text-brand font-medium">
                                  {a.daysUntilDue}{" "}
                                  {a.daysUntilDue === 1
                                    ? "day left"
                                    : "days left"}
                                </span>
                              )}
                            </div>

                            {/* Right due time */}
                            <div className="flex items-center gap-1">
                              <CalendarDays className="w-3 h-3" />
                              <span>Due: {dueLabel}</span>
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </motion.div>
  );
}
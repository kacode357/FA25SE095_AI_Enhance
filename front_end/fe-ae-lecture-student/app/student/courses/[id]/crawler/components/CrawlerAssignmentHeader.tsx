// app/.../crawler/components/CrawlerAssignmentHeader.tsx
"use client";

import { CalendarDays, BookOpen, Users } from "lucide-react";
import type { AssignmentItem } from "@/types/assignments/assignment.response";
import { formatDateTimeVN } from "@/utils/datetime/format-datetime";

type Props = {
  assignment?: AssignmentItem;
  loading: boolean;
  chatConnected: boolean;
  chatConnecting: boolean;
  crawlConnected: boolean;
  crawlConnecting: boolean;
};

function getStatusLabel(assignment?: AssignmentItem) {
  if (!assignment) return "";
  return assignment.statusDisplay || "";
}

function getDueDate(assignment?: AssignmentItem) {
  if (!assignment) return "";
  const raw = assignment.extendedDueDate || assignment.dueDate;
  if (!raw) return "";
  return formatDateTimeVN(raw);
}

export default function CrawlerAssignmentHeader({
  assignment,
  loading,
  chatConnected,
  chatConnecting,
  crawlConnected,
  crawlConnecting,
}: Props) {
  const statusLabel = getStatusLabel(assignment);
  const dueDateLabel = getDueDate(assignment);
  const workspaceLabel = assignment ? "Assignment Workspace" : "Crawler Workspace";

  // Logic gộp trạng thái:
  // Chỉ khi cả 2 hub đều connected thì mới tính là "Ready"
  const isFullyConnected = chatConnected && crawlConnected;
  // Nếu có bất kỳ cái nào đang connecting thì báo "Connecting"
  const isConnecting = chatConnecting || crawlConnecting;

  return (
    <header className="mb-4 flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 shadow-sm md:flex-row md:items-center md:justify-between">
      {/* LEFT: Assignment info */}
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
            <BookOpen className="h-3.5 w-3.5" />
            {workspaceLabel}
          </span>

          {assignment?.isGroupAssignment && (
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-white px-2 py-[2px] text-[10px] font-medium text-[var(--text-muted)]">
              <Users className="h-3 w-3" />
              Group assignment
            </span>
          )}
        </div>

        <h1 className="text-base font-semibold text-[var(--foreground)]">
          {loading
            ? "Đang tải bài tập..."
            : assignment?.title || "Smart Crawl Workspace"}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--text-muted)]">
          {assignment?.courseName && (
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" />
              {assignment.courseName}
            </span>
          )}

          {statusLabel && (
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-white px-2.5 py-[2px] text-[10px] font-medium text-[var(--text-muted)]">
              {statusLabel}
            </span>
          )}

          {dueDateLabel && (
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>Due: {dueDateLabel}</span>
            </span>
          )}

          {typeof assignment?.daysUntilDue === "number" && (
            <span className="inline-flex items-center gap-1">
              ⏱{" "}
              {assignment.daysUntilDue >= 0
                ? `${assignment.daysUntilDue} days left`
                : `${Math.abs(assignment.daysUntilDue)} days overdue`}
            </span>
          )}
        </div>
      </div>

      {/* RIGHT: Unified Agent Status */}
      <div className="mt-2 flex items-center md:mt-0">
        <div
          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
            isFullyConnected
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : isConnecting
              ? "border-amber-200 bg-amber-50 text-amber-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isFullyConnected
                ? "bg-emerald-500"
                : isConnecting
                ? "animate-pulse bg-amber-500"
                : "bg-rose-500"
            }`}
          />
          <span>
            {isFullyConnected
              ? "AI Agent Ready"
              : isConnecting
              ? "Connecting..."
              : "Agent Offline"}
          </span>
        </div>
      </div>
    </header>
  );
}

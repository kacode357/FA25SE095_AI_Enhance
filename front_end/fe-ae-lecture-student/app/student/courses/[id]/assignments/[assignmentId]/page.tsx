// app/student/courses/[id]/assignments/[assignmentId]/page.tsx
"use client";

import { useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  ListTodo,
  Users,
  Mail,
  Shield,
  Loader2,
} from "lucide-react";

import { useAssignmentById } from "@/hooks/assignment/useAssignmentById";
import { AssignmentStatus, GroupItem } from "@/types/assignments/assignment.response";
import { cleanIncomingHtml } from "@/utils/html-normalize";
import { useAllMembers } from "@/hooks/group-member/useAllMembers";

/* ---------- Group members (fetch on mount) ---------- */
function GroupMembersPanel({ groupId }: { groupId: string }) {
  const { members, loading, error, fetchAllMembers } = useAllMembers();
  const didFetchRef = useRef(false);

  useEffect(() => {
    if (!groupId || didFetchRef.current) return;
    didFetchRef.current = true;
    fetchAllMembers(groupId);
  }, [groupId, fetchAllMembers]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-[var(--text-muted)] py-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading members…
      </div>
    );
  }
  if (error) return <div className="text-sm text-red-600 py-2">Error: {error}</div>;
  if (!members || members.length === 0) return <div className="text-sm text-[var(--text-muted)] py-2">No members.</div>;

  return (
    <ul className="mt-2 divide-y divide-[var(--border)]">
      {members.map((m) => (
        <li key={m.id} className="py-2">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-semibold shadow"
              style={{ background: "linear-gradient(135deg, var(--brand), var(--nav-active))" }}
            >
              {m.studentName?.split(" ").map((s) => s[0]).join("").slice(0, 2) || "ST"}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground truncate">{m.studentName}</span>
                {m.isLeader && (
                  <span
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border border-amber-200 text-amber-700"
                    style={{ background: "color-mix(in oklab, orange 12%, #fff)" }}
                    title="Group Leader"
                  >
                    <Shield className="w-3 h-3" />
                    Leader
                  </span>
                )}
              </div>
              <div className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {m.studentEmail}
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();

  const courseId = typeof params?.id === "string" ? params.id : "";
  const assignmentId = typeof params?.assignmentId === "string" ? params.assignmentId : "";

  const { data, loading, fetchAssignment } = useAssignmentById();

  // Guard tránh gọi lặp trong Strict Mode
  const didFetchRef = useRef(false);
  useEffect(() => {
    if (!assignmentId || didFetchRef.current) return;
    didFetchRef.current = true;
    fetchAssignment(assignmentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId]);

  const a = data?.assignment;

  const statusClass = useMemo(() => {
    switch (a?.status) {
      case AssignmentStatus.Draft:
        return "bg-slate-100 text-slate-700 border border-slate-200";
      case AssignmentStatus.Active:
        // dùng brand cho trạng thái Active
        return "bg-[color-mix(in_oklab,var(--brand)_14%,#fff)] text-nav border border-brand";
      case AssignmentStatus.Extended:
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case AssignmentStatus.Overdue:
        return "bg-red-50 text-red-700 border border-red-200";
      case AssignmentStatus.Closed:
        return "bg-gray-100 text-gray-700 border border-gray-200";
      default:
        return "bg-slate-100 text-slate-700 border border-slate-200";
    }
  }, [a?.status]);

  const safeDescription = a?.description ? cleanIncomingHtml(a.description) : "";

  if (!assignmentId) {
    return (
      <div className="py-16 text-center">
        <p className="text-[var(--text-muted)]">
          Không tìm thấy <b>assignmentId</b> trong URL.
        </p>
        <button
          className="btn mt-4 bg-white border border-brand text-nav hover:text-nav-active"
          onClick={() => router.push(`/student/courses/${courseId}`)}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Course
        </button>
      </div>
    );
  }

  if (loading || !a) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-nav">
        <BookOpen className="w-6 h-6 mr-2 animate-pulse text-nav-active" />
        <span className="text-sm">{loading ? "Loading assignment…" : "No data"}</span>
      </div>
    );
  }

  const due = new Date(a.dueDate);
  const extended = a.extendedDueDate ? new Date(a.extendedDueDate) : null;
  const finalDue = extended ?? due;
  const dueLabel = extended ? "Extended due" : "Due";

  return (
    <motion.div
      className="flex flex-col gap-6 py-6 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-nav flex items-center gap-2">
            <ListTodo className="w-7 h-7 text-nav-active" />
            {a.title}
          </h1>

          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className={`text-[11px] px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${statusClass}`}>
              {a.status === AssignmentStatus.Active && <CheckCircle2 className="w-3 h-3" />}
              {a.statusDisplay}
            </span>

            {a.isGroupAssignment && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Users className="w-3 h-3" />
                Group
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="btn bg-white border border-brand text-nav hover:text-nav-active"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>

      {/* GRID 7-3 */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* LEFT: 7/10 — Details & Description */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Details */}
          <div className="card rounded-2xl p-4">
            <div className="mb-2">
              <h2 className="text-lg font-bold text-nav">Details</h2>
            </div>
            <div className="text-sm text-foreground/80 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-nav-active" />
                  <b>Start:</b> {new Date(a.startDate).toLocaleString("en-GB")}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-nav-active" />
                  <b>{dueLabel}:</b> {finalDue.toLocaleString("en-GB")}
                </span>
                {typeof a.maxPoints === "number" && (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-nav-active" />
                    <b>Points:</b> {a.maxPoints}
                  </span>
                )}
              </div>

              <div className="text-xs text-[var(--text-muted)]">
                Created: {new Date(a.createdAt).toLocaleString("en-GB")}
                {a.updatedAt && <> • Updated: {new Date(a.updatedAt).toLocaleString("en-GB")}</>}
              </div>
            </div>
          </div>

          {/* Description (HTML) */}
          <div className="card rounded-2xl p-4">
            <div className="mb-2">
              <h2 className="text-lg font-bold text-nav">Description</h2>
            </div>
            <div className="prose prose-sm max-w-none text-foreground/80">
              {safeDescription ? (
                <div dangerouslySetInnerHTML={{ __html: safeDescription }} />
              ) : (
                <p className="text-[var(--text-muted)]">No description provided.</p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: 3/10 — Meta & Assigned Groups */}
        <div className="lg:col-span-3 flex flex-col gap-4 lg:sticky lg:top-24">
          <div className="card rounded-2xl p-4">
            <div className="mb-2">
              <h3 className="text-base font-bold text-nav">Meta</h3>
            </div>
            <div className="text-sm text-foreground/80 space-y-2">
              <div><b>Course:</b> {a.courseName}</div>
              <div><b>Status:</b> {a.statusDisplay}</div>
              <div><b>Overdue:</b> {a.isOverdue ? "Yes" : "No"}</div>
              {!a.isOverdue && a.daysUntilDue >= 0 && (
                <div><b>Days until due:</b> {a.daysUntilDue}</div>
              )}
              {typeof a.assignedGroupsCount === "number" && (
                <div><b>Assigned groups:</b> {a.assignedGroupsCount}</div>
              )}
            </div>
          </div>

          {Array.isArray(a.assignedGroups) && a.assignedGroups.length > 0 && (
            <div className="card rounded-2xl p-4">
              <div className="mb-2">
                <h3 className="text-base font-bold text-nav">Assigned Groups & Members</h3>
              </div>

              <ul className="space-y-3">
                {a.assignedGroups.map((g: GroupItem) => {
                  const membersLabel =
                    g.maxMembers === null || g.maxMembers === undefined
                      ? `${g.memberCount ?? 0} ${g.memberCount === 1 ? "member" : "members"}`
                      : `${g.memberCount}/${g.maxMembers} ${g.maxMembers === 1 ? "member" : "members"}`;

                  return (
                    <li key={g.id} className="border border-[var(--border)] rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-medium text-foreground truncate">{g.name}</span>
                          <span className="text-xs text-[var(--text-muted)]">• {membersLabel}</span>
                        </div>
                        {g.isLocked && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md border bg-red-50 text-red-700 border-red-200">
                            Locked
                          </span>
                        )}
                      </div>
                      <GroupMembersPanel groupId={g.id} />
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

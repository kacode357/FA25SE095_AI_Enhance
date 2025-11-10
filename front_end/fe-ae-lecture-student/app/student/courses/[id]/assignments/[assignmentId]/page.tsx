// app/student/courses/[id]/assignments/[assignmentId]/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  AlertTriangle,
  Info,
  Tag,
  FileText,
  Rocket,
} from "lucide-react";

import { useAssignmentById } from "@/hooks/assignment/useAssignmentById";
import { AssignmentStatus, GroupItem } from "@/types/assignments/assignment.response";
import { cleanIncomingHtml } from "@/utils/html-normalize";
import { useAllMembers } from "@/hooks/group-member/useAllMembers";

import CreateReportButton from "../components/createReportButton";

/* ============ helpers ============ */
const dt = (s: string | null | undefined) => {
  if (!s) return "";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString("en-GB");
};

/* ---------- Group members panel ---------- */
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
  if (!members || members.length === 0)
    return <div className="text-sm text-[var(--text-muted)] py-2">No members.</div>;

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
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const didFetchRef = useRef(false);
  useEffect(() => {
    if (!assignmentId || didFetchRef.current) return;
    didFetchRef.current = true;
    fetchAssignment(assignmentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId]);

  const a = data?.assignment;

  // ✅ default groupId nếu là group assignment
  useEffect(() => {
    if (!a?.isGroupAssignment) {
      setSelectedGroupId(null);
      return;
    }
    const firstId =
      Array.isArray(a.assignedGroups) && a.assignedGroups.length > 0 ? a.assignedGroups[0].id : null;
    setSelectedGroupId(firstId);
  }, [a?.isGroupAssignment, a?.assignedGroups]);

  const statusClass = useMemo(() => {
    switch (a?.status) {
      case AssignmentStatus.Draft:
        return "bg-slate-100 text-slate-700 border border-slate-200";
      case AssignmentStatus.Active:
        return "bg-[color-mix(in_oklab,var(--brand)_14%,#fff)] text-nav border border-brand";
      case AssignmentStatus.Extended:
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case AssignmentStatus.Overdue:
        return "bg-red-50 text-red-700 border-red-200";
      case AssignmentStatus.Closed:
        return "bg-gray-100 text-gray-700 border-gray-200";
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
          className="btn mt-4 bg-white border border-brand text-nav hover:text-nav-active focus:outline-none focus:ring-4"
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

  const due = a.dueDate ? new Date(a.dueDate) : null;
  const extended = a.extendedDueDate ? new Date(a.extendedDueDate) : null;
  const finalDue = extended ?? due ?? null;
  const dueLabel = extended ? "Extended due" : "Due";

  const chips = [
    { icon: <Tag className="w-3 h-3" />, label: a.topicName },
    ...(a.isGroupAssignment
      ? [
          {
            icon: <Users className="w-3 h-3" />,
            label: "Group",
            className: "bg-indigo-50 text-indigo-700 border border-indigo-200",
          },
        ]
      : []),
  ];

  const showOverdueBanner = a.status === AssignmentStatus.Overdue;
  const showDraftInfo = a.status === AssignmentStatus.Draft;

  return (
    <>
      <motion.div
        className="flex flex-col gap-6 py-6 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* ================= Header ================= */}
        <div className="flex flex-col gap-3">
          {/* Row 1: Title (left) + Back (right) */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-3xl font-bold text-nav flex items-center gap-2 truncate">
                <ListTodo className="w-7 h-7 text-nav-active shrink-0" />
                <span className="truncate">{a.title}</span>
              </h1>

              {/* chips dưới title */}
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${statusClass}`}
                >
                  {a.status === AssignmentStatus.Active && <CheckCircle2 className="w-3 h-3" />}
                  {a.statusDisplay}
                </span>

                {chips.map((c, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200 ${
                      "className" in c ? (c as any).className : ""
                    }`}
                  >
                    {c.icon}
                    {c.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Back button at right, same row with title */}
            <div className="shrink-0 self-start">
              <button
                onClick={() => router.push(`/student/courses/${courseId}`)}
                className="btn bg-white border border-brand text-nav hover:text-nav-active focus:outline-none focus:ring-4"
                title="Back to Course"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>
          </div>

          {/* Row 2: Actions aligned right */}
          <div className="w-full flex justify-end">
            <div className="flex flex-row flex-wrap items-center gap-2">
              <button
                onClick={() =>
                  router.push(`/student/courses/${courseId}/reports?assignmentId=${assignmentId}`)
                }
                className="btn bg-white border border-brand text-nav hover:text-nav-active"
                title="View your reports for this assignment"
              >
                <FileText className="w-4 h-4" />
                <span>View My Reports</span>
              </button>

              {a.isGroupAssignment && Array.isArray(a.assignedGroups) && a.assignedGroups.length > 1 && (
                <select
                  className="border border-[var(--border)] rounded-lg px-3 py-2 bg-white text-sm"
                  value={selectedGroupId ?? ""}
                  onChange={(e) => setSelectedGroupId(e.target.value || null)}
                  title="Choose a group for your report"
                >
                  {a.assignedGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              )}

              <CreateReportButton
                courseId={courseId}
                assignmentId={assignmentId}
                assignmentTitle={a.title}
                isGroupSubmission={!!a.isGroupAssignment}
                groupId={selectedGroupId}
                label="Create Report"
                className="btn btn-gradient px-5 py-2"
              />

              <button
                onClick={() => router.push("/student/crawler")}
                className="btn btn-gradient-slow px-4 py-2"
                title="Start with AI Crawler"
              >
                <Rocket className="w-4 h-4" />
                Start with AI Crawler
              </button>
            </div>
          </div>
        </div>
        {/* =============== /Header =============== */}

        {/* Alerts */}
        {showOverdueBanner && (
          <div className="border border-red-200 rounded-xl p-3 bg-red-50 text-red-700 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="text-sm">
              This assignment is <b>Overdue</b>. Please contact your lecturer if you need assistance.
            </div>
          </div>
        )}
        {showDraftInfo && (
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-slate-700 flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="text-sm">
              This assignment is currently in <b>Draft</b> and may not be visible to students.
            </div>
          </div>
        )}

        {/* GRID 7-3 */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* LEFT: Core Details & Description */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Details */}
            <div className="card rounded-2xl p-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-lg font-bold text-nav flex items-center gap-2">
                  <FileText className="w-5 h-5 text-nav-active" />
                  Details
                </h2>
              </div>

              <div className="text-sm text-foreground/80 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-nav-active" />
                    <b>Start:</b>&nbsp;{dt(a.startDate) || "—"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-nav-active" />
                    <b>{finalDue ? dueLabel : "Due"}:</b>&nbsp;
                    {finalDue ? dt(finalDue.toISOString()) : "—"}
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-nav-active" />
                    <b>Points:</b>&nbsp;{typeof a.maxPoints === "number" ? a.maxPoints : "—"}
                  </div>
                </div>

                {(a.format || a.gradingCriteria) && (
                  <div className="border-t pt-3 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-[var(--text-muted)] mb-1">
                        Format Submit
                      </div>
                      <div>{a.format || "—"}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-[var(--text-muted)] mb-1">
                        Grading Criteria
                      </div>
                      <div className="whitespace-pre-wrap">{a.gradingCriteria || "—"}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="card rounded-2xl p-4">
              <div className="mb-2 flex items-center gap-2">
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

          {/* RIGHT: Meta & Groups */}
          <div className="lg:col-span-3 flex flex-col gap-4 lg:sticky lg:top-24">
            <div className="card rounded-2xl p-4">
              <div className="mb-2">
                <h3 className="text-base font-bold text-nav">Meta</h3>
              </div>
              <div className="text-sm text-foreground/80 space-y-2">
                <div>
                  <b>Status:</b> {a.statusDisplay}
                </div>
                <div>
                  <b>Course:</b> {a.courseName}
                </div>
                <div>
                  <b>Overdue:</b> {a.isOverdue ? "Yes" : "No"}
                </div>
                {!a.isOverdue && a.daysUntilDue >= 0 && (
                  <div>
                    <b>Days until due:</b> {a.daysUntilDue}
                  </div>
                )}
                {typeof a.assignedGroupsCount === "number" && (
                  <div>
                    <b>Assigned groups:</b> {a.assignedGroupsCount}
                  </div>
                )}
                <div className="pt-1 text-xs text-[var(--text-muted)]">
                  Created: {dt(a.createdAt)}
                  {a.updatedAt && <> • Updated: {dt(a.updatedAt)}</>}
                </div>
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
                      g.maxMembers == null
                        ? `${g.memberCount ?? 0} ${g.memberCount === 1 ? "member" : "members"}`
                        : `${g.memberCount}/${g.maxMembers} ${
                            g.maxMembers === 1 ? "member" : "members"
                          }`;
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
    </>
  );
}

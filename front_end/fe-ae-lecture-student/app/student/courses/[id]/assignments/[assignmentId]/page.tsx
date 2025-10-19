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

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useAssignmentById } from "@/hooks/assignment/useAssignmentById";
import { AssignmentStatus, GroupItem } from "@/types/assignments/assignment.response";
import { cleanIncomingHtml } from "@/utils/html-normalize";
import { useAllMembers } from "@/hooks/group-member/useAllMembers";

/** Child: fetch & render members for ONE group (mount là fetch luôn) */
function GroupMembersPanel({ groupId }: { groupId: string }) {
  const { members, loading, error, fetchAllMembers } = useAllMembers();
  const didFetchRef = useRef(false);

  useEffect(() => {
    if (!groupId) return;
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    fetchAllMembers(groupId);
  }, [groupId, fetchAllMembers]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-600 py-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading members…
      </div>
    );
  }

  if (error) return <div className="text-sm text-red-600 py-2">Error: {error}</div>;
  if (!members || members.length === 0) return <div className="text-sm text-slate-500 py-2">No members.</div>;

  return (
    <ul className="mt-2 divide-y divide-slate-200">
      {members.map((m) => (
        <li key={m.id} className="py-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center text-xs font-semibold">
              {m.studentName?.split(" ").map((s) => s[0]).join("").slice(0, 2) || "ST"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900">{m.studentName}</span>
                {m.isLeader && (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                    <Shield className="w-3 h-3" />
                    Leader
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
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
    if (!assignmentId) return;
    if (didFetchRef.current) return;
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
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
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
      <div className="py-16 text-center text-slate-600">
        <p>Không tìm thấy <b>assignmentId</b> trong URL.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push(`/student/courses/${courseId}`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Button>
      </div>
    );
  }

  if (loading || !a) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-green-700">
        <BookOpen className="w-6 h-6 mr-2 animate-pulse" />
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
      className="flex flex-col gap-6 py-6"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-700 flex items-center gap-2">
            <ListTodo className="w-7 h-7 text-green-600" />
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
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      {/* GRID 7-3 */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* LEFT: 7/10 — Details & Description */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Details */}
          <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Details</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-green-600" />
                  <b>Start:</b> {new Date(a.startDate).toLocaleString("en-GB")}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  <b>{dueLabel}:</b> {finalDue.toLocaleString("en-GB")}
                </span>
                {typeof a.maxPoints === "number" && (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <b>Points:</b> {a.maxPoints}
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-500">
                Created: {new Date(a.createdAt).toLocaleString("en-GB")}
                {a.updatedAt && <> • Updated: {new Date(a.updatedAt).toLocaleString("en-GB")}</>}
              </div>
            </CardContent>
          </Card>

          {/* Description (HTML) */}
          <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Description</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-slate-700">
              {safeDescription ? (
                <div dangerouslySetInnerHTML={{ __html: safeDescription }} />
              ) : (
                <p className="text-slate-500">No description provided.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: 3/10 — Meta & Assigned Groups */}
        <div className="lg:col-span-3 flex flex-col gap-4 lg:sticky lg:top-24">
          <Card className="rounded-2xl border border-slate-200 shadow-md bg-white">
            <CardHeader>
              <CardTitle className="text-base font-bold">Meta</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 space-y-2">
              <div><b>Course:</b> {a.courseName}</div>
              <div><b>Status:</b> {a.statusDisplay}</div>
              <div><b>Overdue:</b> {a.isOverdue ? "Yes" : "No"}</div>
              {!a.isOverdue && a.daysUntilDue >= 0 && <div><b>Days until due:</b> {a.daysUntilDue}</div>}
              {typeof a.assignedGroupsCount === "number" && <div><b>Assigned groups:</b> {a.assignedGroupsCount}</div>}
            </CardContent>
          </Card>

          {Array.isArray(a.assignedGroups) && a.assignedGroups.length > 0 && (
            <Card className="rounded-2xl border border-slate-200 shadow-md bg-white">
              <CardHeader>
                <CardTitle className="text-base font-bold">Assigned Groups & Members</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-700">
                <ul className="space-y-3">
                  {a.assignedGroups.map((g: GroupItem) => {
                    const membersLabel =
                      g.maxMembers === null || g.maxMembers === undefined
                        ? `${g.memberCount ?? 0} ${g.memberCount === 1 ? "member" : "members"}`
                        : `${g.memberCount}/${g.maxMembers} ${g.maxMembers === 1 ? "member" : "members"}`;

                    return (
                      <li key={g.id} className="border border-slate-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{g.name}</span>
                            <span className="text-xs text-slate-500">• {membersLabel}</span>
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
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}

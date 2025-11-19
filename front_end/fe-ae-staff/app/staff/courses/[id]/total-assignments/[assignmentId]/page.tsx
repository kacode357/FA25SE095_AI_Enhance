// app/(staff)/staff/courses/[id]/total-assignments/[assignmentId]/page.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAssignmentDetail } from "@/hooks/assignment/useAssignmentDetail";
import { useGroupMembersByGroup } from "@/hooks/group-members/useGroupMembersByGroup";
import { cleanIncomingHtml } from "@/utils/html-normalize";
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  Crown,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Mail,
  UserCircle2,
  Users2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default function AssignmentDetailPage() {
  const { id, assignmentId } = useParams();
  const router = useRouter();

  // --- Hooks cố định thứ tự ---
  const { assignment, loading, fetchAssignment, reset } = useAssignmentDetail();
  const { fetchGroupMembers } = useGroupMembersByGroup(); // dùng để fetch theo group khi cần

  // Guard chống gọi lặp
  const fetchedFor = useRef<string | null>(null);

  // UI state cho members theo group
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [loadingGroupId, setLoadingGroupId] = useState<string | null>(null);
  const [membersCache, setMembersCache] = useState<Record<string, Array<{
    id: string;
    studentName: string;
    studentEmail: string;
    isLeader: boolean;
    roleDisplay: string;
    joinedAt: string;
  }>>>({});

  useEffect(() => {
    const aId = typeof assignmentId === "string" ? assignmentId : "";
    if (!aId) return;
    if (fetchedFor.current !== aId) {
      fetchedFor.current = aId;
      fetchAssignment(aId);
    }
    return () => reset();
  }, [assignmentId, fetchAssignment, reset]);

  // Mô tả: normalize HTML (đặt trước mọi return)
  const descriptionHtml = useMemo(
    () => cleanIncomingHtml(assignment?.description ?? ""),
    [assignment?.description]
  );

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

  const toggleViewMembers = useCallback(
    async (groupId: string) => {
      // collapse nếu đang mở
      if (expandedGroupId === groupId) {
        setExpandedGroupId(null);
        return;
      }

      // mở group mới
      setExpandedGroupId(groupId);

      // nếu đã cache thì thôi
      if (membersCache[groupId]) return;

      // fetch lần đầu
      setLoadingGroupId(groupId);
      const res = await fetchGroupMembers(groupId);
      setLoadingGroupId(null);

      if (res?.members) {
        setMembersCache((prev) => ({
          ...prev,
          [groupId]: res.members.map((m) => ({
            id: m.id,
            studentName: m.studentName,
            studentEmail: m.studentEmail,
            isLeader: m.isLeader,
            roleDisplay: m.roleDisplay,
            joinedAt: m.joinedAt,
          })),
        }));
      }
    },
    [expandedGroupId, membersCache, fetchGroupMembers]
  );

  // --- Returns sau cùng, không thay đổi thứ tự hooks ---
  if (loading && !assignment) {
    return (
      <div className="p-6 flex items-center justify-center gap-2" style={{ color: "var(--color-muted)" }}>
        <Loader2 className="size-4 animate-spin" /> Loading assignment...
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="p-6 text-center" style={{ color: "var(--color-muted)" }}>
        Assignment not found.
        <div className="mt-4">
          <Button onClick={() => router.push(`/staff/courses/${id}/total-assignments`)} className="rounded-xl btn btn-gradient-slow">
            ← Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold truncate" style={{ color: "var(--foreground)" }}>
            {assignment.title}
          </h1>
          <p className="text-sm truncate" style={{ color: "var(--color-muted)" }}>
            {assignment.courseName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/staff/courses/${id}/total-assignments`}>
            <Button className="rounded-xl btn btn-gradient-slow" variant="outline">
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Button>
          </Link>
          <Badge className={statusClass(assignment.status, assignment.isOverdue)}>
            {assignment.statusDisplay || (assignment.isOverdue ? "Overdue" : "Status")}
          </Badge>
        </div>
      </div>

      {/* Overview */}
      <Card className="border card rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base" style={{ color: "var(--foreground)" }}>
            Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow icon={<ClipboardList className="size-4" />} label="Points" value={String(assignment.maxPoints)} />
          <InfoRow icon={<CalendarDays className="size-4" />} label="Start" value={fmtDate(assignment.startDate)} />
          <InfoRow icon={<CalendarDays className="size-4" />} label="Due" value={fmtDate(assignment.dueDate)} />
          <InfoRow icon={<CalendarDays className="size-4" />} label="Extended Due" value={fmtDate(assignment.extendedDueDate)} />
          <InfoRow icon={<Users2 className="size-4" />} label="Group Assignment" value={assignment.isGroupAssignment ? "Yes" : "No"} />
          <InfoRow icon={<Users2 className="size-4" />} label="Assigned Groups" value={String(assignment.assignedGroupsCount)} />
        </CardContent>
      </Card>

      {/* Assigned groups + Members */}
      <Card className="border card rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base" style={{ color: "var(--foreground)" }}>
            Assigned Groups ({assignment.assignedGroups?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!assignment.assignedGroups || assignment.assignedGroups.length === 0 ? (
            <div className="p-6 text-sm" style={{ color: "var(--color-muted)" }}>
              No groups assigned.
            </div>
          ) : (
            <ul className="divide-y" style={{ borderColor: "var(--color-border)" }}>
              {assignment.assignedGroups.map((g) => {
                const isOpen = expandedGroupId === g.id;
                const cached = membersCache[g.id];
                const isLoadingMembers = loadingGroupId === g.id;

                return (
                  <li key={g.id} className="p-4 space-y-3">
                    {/* Group row */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="size-9 grid place-items-center rounded-2xl border shrink-0"
                          style={{
                            background: "color-mix(in oklab, var(--color-brand) 8%, transparent)",
                            borderColor:
                              "color-mix(in oklab, var(--color-brand) 18%, var(--color-border))",
                          }}
                          title={g.name}
                        >
                          <Users2 className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate" style={{ color: "var(--foreground)" }}>
                            {g.name}
                          </div>
                          <div
                            className="flex flex-wrap items-center gap-3 text-xs"
                            style={{ color: "var(--color-muted)" }}
                          >
                            {g.assignmentTitle && (
                              <span className="inline-flex items-center gap-1">
                                <FileText className="size-3.5" />
                                {g.assignmentTitle}
                              </span>
                            )}
                            {typeof g.memberCount === "number" && (
                              <span className="inline-flex items-center gap-1">
                                <Users2 className="size-3.5" />
                                {g.maxMembers != null
                                  ? `${g.memberCount} / ${g.maxMembers}`
                                  : `${g.memberCount} members`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          className="rounded-xl"
                          variant="outline"
                          onClick={() => toggleViewMembers(g.id)}
                          disabled={isLoadingMembers}
                        >
                          {isOpen ? <EyeOff className="mr-2 size-4" /> : <Eye className="mr-2 size-4" />}
                          {isOpen ? "Hide members" : "View members"}
                        </Button>
                      </div>
                    </div>

                    {/* Members list (expand) */}
                    {isOpen && (
                      <div className="rounded-xl border p-3" style={{ borderColor: "var(--color-border)" }}>
                        {isLoadingMembers ? (
                          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--color-muted)" }}>
                            <Loader2 className="size-4 animate-spin" /> Loading members...
                          </div>
                        ) : !cached || cached.length === 0 ? (
                          <div className="text-sm" style={{ color: "var(--color-muted)" }}>
                            No members.
                          </div>
                        ) : (
                          <ul className="space-y-2">
                            {cached.map((m) => (
                              <li key={m.id} className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div
                                    className="size-8 grid place-items-center rounded-2xl border shrink-0"
                                    style={{
                                      background:
                                        "color-mix(in oklab, var(--color-brand) 8%, transparent)",
                                      borderColor:
                                        "color-mix(in oklab, var(--color-brand) 18%, var(--color-border))",
                                    }}
                                  >
                                    <UserCircle2 className="size-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-medium truncate" style={{ color: "var(--foreground)" }}>
                                      {m.studentName}
                                    </div>
                                    <div
                                      className="flex items-center gap-2 text-xs truncate"
                                      style={{ color: "var(--color-muted)" }}
                                    >
                                      <span className="inline-flex items-center gap-1">
                                        <Mail className="size-3.5" />
                                        {m.studentEmail}
                                      </span>
                                      <span>• {m.roleDisplay}</span>
                                      <span>• Joined: {fmtDate(m.joinedAt)}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="shrink-0">
                                  {m.isLeader && (
                                    <Badge className="bg-amber-100 text-amber-700 border border-amber-200">
                                      <Crown className="mr-1 size-3.5" />
                                      Leader
                                    </Badge>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Description — bung full, HTML đã clean */}
      {descriptionHtml && (
        <Card className="border card rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base" style={{ color: "var(--foreground)" }}>
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              style={{ color: "var(--foreground)" }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-xl border p-3"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="flex items-center gap-2" style={{ color: "var(--color-muted)" }}>
        <div
          className="p-2 rounded-xl border"
          style={{
            background: "color-mix(in oklab, var(--color-brand) 8%, transparent)",
            borderColor: "color-mix(in oklab, var(--color-brand) 18%, var(--color-border))",
          }}
        >
          {icon}
        </div>
        <span className="text-sm">{label}</span>
      </div>
      <div className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
        {value}
      </div>
    </div>
  );
}

// app/student/courses/[id]/groups/[groupId]/page.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAllMembers } from "@/hooks/group-member/useAllMembers";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Shield,
  Mail,
  Loader2,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { GroupMemberRole } from "@/config/classroom-service/group-member-role.enum";

/** ====== Types (đồng bộ field từ BE) ====== */
type MemberLike = {
  id: string;
  studentName: string;
  studentEmail: string;
  joinedAt: string;
  role?: number | null;
  roleDisplay?: string | null;
  isLeader?: boolean;
  groupName?: string;
};

/** ====== Role helpers dùng enum + CSS badge ====== */

const ROLE_LABEL_MAP: Record<GroupMemberRole, string> = {
  [GroupMemberRole.Member]: "Member",
  [GroupMemberRole.Leader]: "Leader",
  [GroupMemberRole.Presenter]: "Presenter",
  [GroupMemberRole.Researcher]: "Researcher",
  [GroupMemberRole.Writer]: "Writer",
};

const ROLE_CLASS_MAP: Record<GroupMemberRole, string> = {
  [GroupMemberRole.Member]: "badge-group-role--member",
  [GroupMemberRole.Leader]: "badge-group-role--leader",
  [GroupMemberRole.Presenter]: "badge-group-role--presenter",
  [GroupMemberRole.Researcher]: "badge-group-role--researcher",
  [GroupMemberRole.Writer]: "badge-group-role--writer",
};

function detectRole(m: MemberLike): GroupMemberRole {
  // Ưu tiên numeric từ BE
  if (typeof m.role === "number" && m.role >= 1 && m.role <= 5) {
    return m.role as GroupMemberRole;
  }

  // Text từ BE
  if (typeof m.roleDisplay === "string" && m.roleDisplay.trim().length > 0) {
    const text = m.roleDisplay.trim().toLowerCase();
    if (text === "leader") return GroupMemberRole.Leader;
    if (text === "presenter") return GroupMemberRole.Presenter;
    if (text === "researcher") return GroupMemberRole.Researcher;
    if (text === "writer") return GroupMemberRole.Writer;
    return GroupMemberRole.Member;
  }

  // Flag cũ isLeader
  if (m.isLeader) {
    return GroupMemberRole.Leader;
  }

  // Fallback
  return GroupMemberRole.Member;
}

function getRoleLabel(m: MemberLike) {
  const role = detectRole(m);
  return ROLE_LABEL_MAP[role] ?? "Member";
}

function getRoleBadgeClass(m: MemberLike) {
  const role = detectRole(m);
  return ROLE_CLASS_MAP[role] ?? ROLE_CLASS_MAP[GroupMemberRole.Member];
}

function isLeaderRole(m: MemberLike) {
  return detectRole(m) === GroupMemberRole.Leader;
}

function initials(full?: string) {
  if (!full) return "ST";
  const parts = full.trim().split(/\s+/);
  const chars = parts.map((p) => p[0]).join("").slice(0, 2);
  return chars.toUpperCase() || "ST";
}

export default function GroupMembersPage() {
  const params = useParams();
  const router = useRouter();

  const courseId = typeof params?.id === "string" ? params.id : "";
  const groupId = typeof params?.groupId === "string" ? params.groupId : "";

  const { members, loading, error, fetchAllMembers } = useAllMembers();

  useEffect(() => {
    if (groupId) fetchAllMembers(groupId);
  }, [groupId, fetchAllMembers]);

  const groupName = useMemo(() => members?.[0]?.groupName ?? "", [members]);

  if (!groupId) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-slate-600 px-4 sm:px-6 lg:px-8">
        <AlertCircle className="w-8 h-8 text-slate-400" />
        <p>
          Could not find <b>groupId</b> in the path.
        </p>
        <Button
          variant="outline"
          className="border-brand text-nav hover:text-nav-active"
          onClick={() => router.push(`/student/courses/${courseId}/groups`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Groups
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh] text-brand">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span className="text-sm text-brand">Loading members…</span>
      </div>
    );
  }

  const isEmpty = !members || members.length === 0;

  return (
    <div className="flex flex-col gap-6 py-6 px-4 sm:px-6 lg:px-8">
      {/* ====== Header ====== */}
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3">
          <div
            className="rounded-xl p-2 border border-brand"
            style={{
              background:
                "color-mix(in oklab, var(--brand) 12%, var(--white))",
            }}
            aria-hidden
          >
            <Users className="w-6 h-6 text-brand" />
          </div>
        </div>

        <div className="flex-1 ml-3">
          <h1 className="text-2xl font-bold text-nav">Group Members</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {groupName ? (
              <>
                Group: <b className="text-foreground">{groupName}</b>
              </>
            ) : (
              <>
                Group ID: <code className="text-xs">{groupId}</code>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-brand text-nav hover:text-nav-active"
            onClick={() => router.push(`/student/courses/${courseId}/groups`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Groups
          </Button>
        </div>
      </div>

      {/* ====== Error ====== */}
      {error && (
        <Card className="card border-red-200 bg-red-50/70">
          <CardContent className="py-4 text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </CardContent>
        </Card>
      )}

      {/* ====== Empty ====== */}
      {isEmpty ? (
        <Card className="card">
          <CardContent className="py-10 text-center text-[var(--text-muted)]">
            <Users className="w-10 h-10 mx-auto mb-3 text-[var(--muted)]" />
            <p>This group has no members yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-nav">
              Members ({members.length})
            </CardTitle>
          </CardHeader>

          <CardContent>
            <ul className="divide-y divide-[var(--border)]">
              {members.map((m: MemberLike) => {
                const roleLabel = getRoleLabel(m);
                const isLeader = isLeaderRole(m);
                const badgeClass = getRoleBadgeClass(m);

                return (
                  <li
                    key={m.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                  >
                    {/* Left: avatar + name + email + role badge */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full text-white flex items-center justify-center text-sm font-semibold shadow"
                        style={{
                          background:
                            "linear-gradient(135deg, var(--brand), var(--nav-active))",
                        }}
                      >
                        {initials(m.studentName)}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {m.studentName}
                          </span>

                          {/* Role badge – màu lấy từ group-member-role.css */}
                          <span
                            className={`badge-group-role ${badgeClass}`}
                            title={roleLabel}
                          >
                            {isLeader && (
                              <Shield className="w-3 h-3" aria-hidden />
                            )}
                            {roleLabel}
                          </span>
                        </div>

                        <div className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {m.studentEmail}
                        </div>
                      </div>
                    </div>

                    {/* Right: chỉ giữ Joined, bỏ Role trùng */}
                    <div className="flex items-center gap-4 text-xs text-foreground/70">
                      <div className="text-[var(--text-muted)]">
                        Joined:{" "}
                        {new Date(m.joinedAt).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
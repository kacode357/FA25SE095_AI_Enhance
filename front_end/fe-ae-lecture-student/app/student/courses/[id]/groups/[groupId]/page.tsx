// app/student/courses/[id]/groups/[groupId]/page.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAllMembers } from "@/hooks/group-member/useAllMembers";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  User,
  Shield,
  Mail,
  Loader2,
  RefreshCw,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

/** ====== BE enum mapping ====== */
const ROLE_MAP: Record<number, string> = {
  1: "Member",
  2: "Leader",
  3: "Presenter",
  4: "Researcher",
  5: "Writer",
};

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

/** ====== Helpers ====== */
function getRoleLabel(m: MemberLike) {
  if (m.roleDisplay && m.roleDisplay.trim().length > 0) return m.roleDisplay.trim();
  if (typeof m.role === "number" && ROLE_MAP[m.role]) return ROLE_MAP[m.role];
  if (m.isLeader) return "Leader";
  return "Member";
}

function isLeaderLike(m: MemberLike) {
  const byNumber = typeof m.role === "number" && m.role === 2;
  const byText =
    typeof m.roleDisplay === "string" &&
    m.roleDisplay.toLowerCase().trim() === "leader";
  return Boolean(m.isLeader || byNumber || byText);
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

  const onRefresh = () => {
    if (groupId) fetchAllMembers(groupId);
  };

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

          {/* Dùng gradient tím-hồng chậm trong globals.css */}
          <Button
            type="button"
            className="btn-gradient-slow px-4 py-2"
            onClick={onRefresh}
            title="Refresh members"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
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
                const leaderBadge = isLeaderLike(m);

                return (
                  <li
                    key={m.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                  >
                    {/* Left: avatar + name + email */}
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
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {m.studentName}
                          </span>

                          {leaderBadge && (
                            <span
                              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border border-accent text-accent"
                              style={{
                                background:
                                  "color-mix(in oklab, var(--accent) 16%, #fff)",
                              }}
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

                    {/* Right: meta */}
                    <div className="flex items-center gap-4 text-xs text-foreground/70">
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[var(--muted)]" />
                        <span>
                          Role:{" "}
                          <b className="text-foreground/80">{roleLabel}</b>
                        </span>
                      </div>
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

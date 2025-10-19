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

// BE enum mapping
const ROLE_MAP: Record<number, string> = {
  1: "Member",
  2: "Leader",
  3: "Presenter",
  4: "Researcher",
  5: "Writer",
};

type MemberLike = {
  id: string;
  studentName: string;
  studentEmail: string;
  joinedAt: string;
  // optional fields we may receive
  role?: number | null;
  roleDisplay?: string | null;
  isLeader?: boolean;
  groupName?: string;
};

function getRoleLabel(m: MemberLike) {
  // 1) prefer server-provided label
  if (m.roleDisplay && m.roleDisplay.trim().length > 0) return m.roleDisplay.trim();

  // 2) map numeric role
  if (typeof m.role === "number" && ROLE_MAP[m.role]) return ROLE_MAP[m.role];

  // 3) fallback using isLeader flag
  if (m.isLeader) return "Leader";

  // 4) default
  return "Member";
}

function isLeaderLike(m: MemberLike) {
  const byNumber = typeof m.role === "number" && m.role === 2;
  const byText =
    typeof m.roleDisplay === "string" &&
    m.roleDisplay.toLowerCase().trim() === "leader";
  return Boolean(m.isLeader || byNumber || byText);
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
      <div className="flex justify-center items-center h-[50vh] text-green-600">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span className="text-sm">Loading members…</span>
      </div>
    );
  }

  const isEmpty = !members || members.length === 0;

  return (
    <div className="flex flex-col gap-6 py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2">
            <Users className="w-6 h-6 text-emerald-700" />
          </div>
        </div>

        <div className="flex-1 ml-3">
          <h1 className="text-2xl font-bold text-green-700">Group Members</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {groupName ? (
              <>
                Group: <b>{groupName}</b> • ID:{" "}
                <code className="text-xs">{groupId}</code>
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
            onClick={() => router.push(`/student/courses/${courseId}/groups`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Groups
          </Button>
          <Button variant="secondary" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Card className="rounded-2xl border border-red-200 bg-red-50/60">
          <CardContent className="py-4 text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </CardContent>
        </Card>
      )}

      {/* Empty */}
      {isEmpty ? (
        <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white">
          <CardContent className="py-10 text-center text-slate-600">
            <Users className="w-10 h-10 mx-auto mb-3 text-slate-400" />
            <p>This group has no members yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl border border-slate-200 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">
              Members ({members.length})
            </CardTitle>
          </CardHeader>

          <CardContent>
            <ul className="divide-y divide-slate-200">
              {members.map((m: any) => {
                const roleLabel = getRoleLabel(m as MemberLike);
                const leaderBadge = isLeaderLike(m as MemberLike);

                return (
                  <li
                    key={m.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                  >
                    {/* Left: avatar + name + email */}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center text-sm font-semibold">
                        {m.studentName?.split(" ").map((s: string) => s[0]).join("").slice(0, 2) ||
                          "ST"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {m.studentName}
                          </span>

                          {leaderBadge && (
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

                    {/* Right: meta */}
                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>Role: {roleLabel}</span>
                      </div>
                      <div className="text-slate-500">
                        Joined: {new Date(m.joinedAt).toLocaleString("en-GB")}
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

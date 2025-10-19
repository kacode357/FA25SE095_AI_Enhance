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
    if (groupId) fetchAllMembers(groupId); // hook đã không cache cứng nên gọi lại là đủ
  };

  if (!groupId) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-slate-600">
        <AlertCircle className="w-8 h-8 text-slate-400" />
        <p>Không tìm thấy <b>groupId</b> trong đường dẫn.</p>
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
    <div className="flex flex-col gap-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2">
            <Users className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-green-700">
              Group Members
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {groupName ? (
                <>
                  Group: <b>{groupName}</b> • ID: <code className="text-xs">{groupId}</code>
                </>
              ) : (
                <>Group ID: <code className="text-xs">{groupId}</code></>
              )}
            </p>
          </div>
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
            <p>Nhóm này chưa có thành viên nào.</p>
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
              {members.map((m) => (
                <li
                  key={m.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  {/* Left: name + email */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center text-sm font-semibold">
                      {m.studentName?.split(" ").map((s) => s[0]).join("").slice(0,2) || "ST"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">
                          {m.studentName}
                        </span>
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

                  {/* Right: meta */}
                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>Role: {m.roleDisplay || (m.isLeader ? "Leader" : "Student")}</span>
                    </div>
                    <div className="text-slate-500">
                      Joined: {new Date(m.joinedAt).toLocaleString("en-GB")}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

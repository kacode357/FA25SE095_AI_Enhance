// app/(staff)/staff/manager/courses/[id]/total-groups/[groupId]/page.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGroupMembersByGroup } from "@/hooks/group-members/useGroupMembersByGroup";
import { ArrowLeft, Crown, Loader2, Mail, UserCircle2, Users2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

export default function GroupMembersPage() {
  const { id, groupId } = useParams();
  const router = useRouter();
  const { members, loading, fetchGroupMembers, reset } = useGroupMembersByGroup();

  // Guard tránh gọi lặp
  const fetchedFor = useRef<string | null>(null);
  useEffect(() => {
    const gId = typeof groupId === "string" ? groupId : "";
    if (!gId) return;

    if (fetchedFor.current !== gId) {
      fetchedFor.current = gId;
      fetchGroupMembers(gId);
    }
    return () => reset();
  }, [groupId, fetchGroupMembers, reset]);

  const groupName = useMemo(() => members[0]?.groupName ?? "Group", [members]);
  const total = members.length;

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
            {groupName}
          </h1>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            Members ({total})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/staff/courses/${id}/total-groups`}>
            <Button className="rounded-xl btn btn-gradient-slow" variant="outline">
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary */}
      <Card className="border card rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base" style={{ color: "var(--foreground)" }}>
            Total Members
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3" style={{ color: "var(--color-muted)" }}>
            <div
              className="p-2 rounded-2xl border"
              style={{
                background: "color-mix(in oklab, var(--color-brand) 8%, transparent)",
                borderColor: "color-mix(in oklab, var(--color-brand) 18%, var(--color-border))",
              }}
            >
              <Users2 className="size-5" />
            </div>
            <span className="text-sm">Members</span>
          </div>
          <div className="min-w-[3rem] text-3xl font-bold" style={{ color: "var(--foreground)" }}>
            {loading ? <Loader2 className="size-5 animate-spin opacity-70" /> : total}
          </div>
        </CardContent>
      </Card>

      {/* List members */}
      <Card className="border card rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base" style={{ color: "var(--foreground)" }}>
            Member List
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 flex items-center gap-2" style={{ color: "var(--color-muted)" }}>
              <Loader2 className="size-4 animate-spin" /> Loading members...
            </div>
          ) : total === 0 ? (
            <div className="p-8 text-center text-sm" style={{ color: "var(--color-muted)" }}>
              No members.
            </div>
          ) : (
            <ul className="divide-y" style={{ borderColor: "var(--color-border)" }}>
              {members.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-4 p-4"
                  style={{ color: "var(--foreground)" }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="size-9 grid place-items-center rounded-2xl border shrink-0"
                      style={{
                        background: "color-mix(in oklab, var(--color-brand) 8%, transparent)",
                        borderColor:
                          "color-mix(in oklab, var(--color-brand) 18%, var(--color-border))",
                      }}
                      title={m.studentName}
                    >
                      <UserCircle2 className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{m.studentName}</div>
                      <div className="text-xs flex items-center gap-2 truncate" style={{ color: "var(--color-muted)" }}>
                        <span className="inline-flex items-center gap-1">
                          <Mail className="size-3.5" />
                          {m.studentEmail}
                        </span>
                        <span>• {m.roleDisplay}</span>
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
        </CardContent>
      </Card>
    </div>
  );
}

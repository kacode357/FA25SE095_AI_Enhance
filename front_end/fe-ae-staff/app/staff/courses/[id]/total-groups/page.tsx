// app/(staff)/staff/courses/[id]/total-groups/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGroupsByCourse } from "@/hooks/group/useGroupsByCourse";
import {
  Crown,
  Eye,
  FileText,
  LayoutGrid,
  Loader2,
  Lock,
  Unlock,
  Users2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

export default function TotalGroupsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data, loading, fetchGroupsByCourse, reset } = useGroupsByCourse();

  // Guard tránh gọi API lặp
  const fetchedFor = useRef<string | null>(null);
  useEffect(() => {
    const courseId = typeof id === "string" ? id : "";
    if (!courseId) return;

    if (fetchedFor.current !== courseId) {
      fetchedFor.current = courseId;
      fetchGroupsByCourse(courseId);
    }
    return () => reset();
  }, [id, fetchGroupsByCourse, reset]);

  const groups = data?.groups ?? [];
  const total = groups.length;

  const items = useMemo(
    () =>
      groups.map((g) => ({
        id: g.id,
        name: g.name,
        description: g.description ?? "",
        isLocked: g.isLocked,
        memberCount: g.memberCount,
        maxMembers: g.maxMembers,
        leaderName: g.leaderName ?? "",
        assignmentTitle: g.assignmentTitle ?? "",
      })),
    [groups]
  );

  const getInitials = (s: string) =>
    s
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((x) => x[0]?.toUpperCase() ?? "")
      .join("");

  // Tính phần trăm đầy nhóm (0..100)
  const percent = (memberCount: number, maxMembers?: number | null) => {
    if (maxMembers == null || maxMembers <= 0) return null;
    const p = Math.min(100, Math.max(0, Math.round((memberCount / maxMembers) * 100)));
    return p;
  };

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
          Groups ({total})
        </h1>
        <Button onClick={() => router.push(`/staff/courses/${id}`)} className="rounded-xl btn btn-green-slow">
          ← Back
        </Button>
      </div>

      {/* Summary */}
      <Card className="border card gap-0 rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base" style={{ color: "var(--foreground)" }}>
            Total Groups
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
              <LayoutGrid className="size-5" />
            </div>
            <span className="text-sm">Groups</span>
          </div>
          <div className="min-w-[3rem] text-3xl font-bold" style={{ color: "var(--foreground)" }}>
            {loading ? <Loader2 className="size-5 animate-spin opacity-70" /> : total}
          </div>
        </CardContent>
      </Card>

      {/* Grid groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <Card className="border card gap-0 rounded-2xl md:col-span-2 xl:col-span-3">
            <CardContent className="p-6 flex items-center gap-2" style={{ color: "var(--color-muted)" }}>
              <Loader2 className="size-4 animate-spin" /> Loading groups...
            </CardContent>
          </Card>
        ) : items.length === 0 ? (
          <Card className="border card gap-0 rounded-2xl md:col-span-2 xl:col-span-3">
            <CardContent className="p-8 text-center text-sm" style={{ color: "var(--color-muted)" }}>
              No groups found.
            </CardContent>
          </Card>
        ) : (
          items.map((g) => {
            const p = percent(g.memberCount, g.maxMembers);
            return (
              <Card key={g.id} className="border card gap-0 rounded-2xl">
                <CardContent className="p-4 flex flex-col gap-3">
                  {/* Row 1: Tên + trạng thái mở/khóa */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold truncate" style={{ color: "var(--foreground)" }}>
                        {g.name}
                      </div>
                      {g.description && (
                        <div className="text-xs truncate" style={{ color: "var(--color-muted)" }}>
                          {g.description}
                        </div>
                      )}
                    </div>
                    <div
                      className="inline-flex items-center gap-1 rounded-xl px-2 py-1 text-xs border"
                      style={{
                        color: g.isLocked ? "#991b1b" : "#065f46",
                        background: g.isLocked
                          ? "color-mix(in oklab, #ef4444 12%, transparent)"
                          : "color-mix(in oklab, var(--color-brand) 12%, transparent)",
                        borderColor: "var(--color-border)",
                      }}
                      title={g.isLocked ? "Locked" : "Open"}
                    >
                      {g.isLocked ? <Lock className="size-3.5" /> : <Unlock className="size-3.5" />}
                      {g.isLocked ? "Locked" : "Open"}
                    </div>
                  </div>

                  {/* Row 2: Chips phụ */}
                  <div className="flex flex-wrap items-center gap-2">
                    {g.leaderName && (
                      <span
                        className="inline-flex items-center gap-1 rounded-xl px-2 py-1 text-xs border"
                        style={{ color: "var(--foreground)", borderColor: "#e2e8f0"  }}
                        title={`Leader: ${g.leaderName}`}
                      >
                        <Crown className="size-3.5" /> {g.leaderName}
                      </span>
                    )}
                    {g.assignmentTitle && (
                      <span
                        className="inline-flex items-center gap-1 rounded-xl px-2 py-1 text-xs border"
                        style={{ color: "var(--foreground)", borderColor: "#e2e8f0"  }}
                        title={`Assignment: ${g.assignmentTitle}`}
                      >
                        <FileText className="size-3.5" /> {g.assignmentTitle}
                      </span>
                    )}
                  </div>

                  {/* Row 3: Membership widget */}
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className="inline-flex items-center gap-1.5 rounded-xl px-2 py-1 text-xs border"
                      style={{ color: "var(--foreground)", borderColor: "#e2e8f0"  }}
                    >
                      <Users2 className="size-3.5" />
                      {g.maxMembers != null ? (
                        <span>
                          {g.memberCount} / {g.maxMembers}
                        </span>
                      ) : (
                        <span>{g.memberCount} members</span>
                      )}
                    </div>

                    {/* View members link */}
                    <Link href={`/staff/courses/${id}/total-groups/${g.id}`}>
                      <Button variant="outline" className="rounded-xl btn btn-green-slow">
                        <Eye className="mr-2 size-4" />
                        View members
                      </Button>
                    </Link>
                  </div>

                  {/* Progress mảnh, chỉ khi có maxMembers */}
                  {g.maxMembers != null && (
                    <div
                      className="w-full h-2 rounded-full border overflow-hidden"
                      style={{ borderColor: "#e2e8f0" , background: "rgba(100,116,139,0.15)" }}
                      aria-label="Group capacity"
                    >
                      <div
                        className="h-full"
                        style={{
                          width: `${p ?? 0}%`,
                          background: "var(--color-brand)",
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

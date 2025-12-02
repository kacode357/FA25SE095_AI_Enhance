// app/student/courses/[id]/chat/components/StudentsList.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useGetUsersInCourse } from "@/hooks/chat/useGetUsersInCourse";
import type {
  CourseChatUserItemResponse as ChatUser,
  GetUsersInCourseResponse,
} from "@/types/chat/chat.response";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

type UnreadItem = { userId: string; unreadCount: number };

type Props = {
  courseId: string;
  selectedUserId?: string | null;
  onSelect: (user: ChatUser) => void;
  unreadMap?: Record<string, number>;
  onInitialUnreadLoaded?: (items: UnreadItem[]) => void;
};

function initialOf(name?: string | null) {
  if (!name) return "?";
  const t = name.trim();
  return t ? t.charAt(0).toUpperCase() : "?";
}

export default function StudentsList({
  courseId,
  selectedUserId,
  onSelect,
  unreadMap,
  onInitialUnreadLoaded,
}: Props) {
  const { getUsersInCourse, loading } = useGetUsersInCourse();
  const [users, setUsers] = useState<ChatUser[]>([]);

  // Cờ đánh dấu đã auto-select chưa (tránh chọn lại khi user đang click người khác)
  const hasAutoSelected = useRef(false);

  // 1. Effect chỉ để Load Data
  useEffect(() => {
    if (!courseId) return;

    (async () => {
      try {
        const res = (await getUsersInCourse(courseId)) as GetUsersInCourseResponse;
        const list = Array.isArray(res) ? res : res?.users ?? [];
        setUsers(list);

        // Seed unread unread
        if (onInitialUnreadLoaded) {
          onInitialUnreadLoaded(
            list.map((u) => ({
              userId: u.id,
              unreadCount: u.unreadCount ?? 0,
            })),
          );
        }
      } catch (err) {
        console.error("[StudentsList] getUsersInCourse error:", err);
        setUsers([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  // 2. Effect riêng để Auto Select User đầu tiên
  useEffect(() => {
    // Điều kiện:
    // - Có danh sách user
    // - Chưa chọn ai (selectedUserId null)
    // - Chưa từng auto select lần nào trong phiên này
    if (users.length > 0 && !selectedUserId && !hasAutoSelected.current) {
      hasAutoSelected.current = true; // Đánh dấu đã chọn rồi
      onSelect(users[0]); // Chọn thằng đầu tiên
    }
  }, [users, selectedUserId, onSelect]);

  return (
    <aside className="col-span-12 md:col-span-6 lg:col-span-5 xl:col-span-4">
      <Card className="border-[var(--border)] bg-[var(--card)] shadow-sm h-[520px] flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-semibold text-nav">
                Class members
              </CardTitle>
              <CardDescription className="text-xs text-[var(--text-muted)]">
                Pick a user to start chatting
              </CardDescription>
            </div>
            {users.length > 0 && (
              <span className="rounded-full bg-[var(--brand)]/10 px-2.5 py-0.5 text-[11px] font-medium text-[var(--brand-700)]">
                {users.length} members
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0 flex-1">
          <ScrollArea className="h-[400px] pr-3">
            <div className="divide-y divide-[var(--border)]">
              {loading && (
                <div className="space-y-2 p-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-3 w-3/4 rounded-full" />
                        <Skeleton className="h-3 w-1/2 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && users.length === 0 && (
                <div className="p-4 text-xs text-[var(--text-muted)]">
                  No users found.
                </div>
              )}

              {!loading &&
                users.map((u) => {
                  const active = selectedUserId === u.id;
                  const unread =
                    (unreadMap && typeof unreadMap[u.id] === "number"
                      ? unreadMap[u.id]
                      : u.unreadCount) ?? 0;
                  const showUnread = unread > 0;

                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => onSelect(u)}
                      className={[
                        "flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-all",
                        "hover:bg-white/70",
                        active
                          ? "bg-[var(--brand)]/6 border-l-4 border-l-[var(--brand-600)]"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar className="h-9 w-9 border border-[var(--border)] shadow-sm">
                          <AvatarImage
                            src={u.profilePictureUrl || undefined}
                            alt={u.fullName || "avatar"}
                          />
                          <AvatarFallback className="bg-[var(--background)] text-[var(--brand-700)] text-xs font-semibold">
                            {initialOf(u.fullName)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-900">
                            {u.fullName || "Unknown user"}
                          </p>
                          <p className="truncate text-[11px] text-[var(--text-muted)]">
                            {u.email}
                            {u.studentId ? ` • ${u.studentId}` : ""}
                          </p>
                        </div>
                      </div>

                      {showUnread && (
                        <span className="ml-2 inline-flex min-w-[20px] items-center justify-center rounded-full bg-[var(--brand-600)] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                          {unread > 99 ? "99+" : unread}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>

            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </CardContent>
      </Card>
    </aside>
  );
}
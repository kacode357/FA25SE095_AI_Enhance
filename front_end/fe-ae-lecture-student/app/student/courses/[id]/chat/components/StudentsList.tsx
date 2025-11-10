// app/student/courses/[id]/chat/components/StudentsList.tsx
"use client";

import { useEffect, useState } from "react";
import { useGetUsersInCourse } from "@/hooks/chat/useGetUsersInCourse";
import type { CourseChatUserItemResponse as ChatUser, GetUsersInCourseResponse } from "@/types/chat/chat.response";

function initialOf(name?: string) {
  if (!name) return "?";
  const t = name.trim();
  return t ? t.charAt(0).toUpperCase() : "?";
}

function AvatarCircle({
  src,
  alt,
  size = 36,
  name,
}: {
  src?: string | null;
  alt?: string;
  size?: number;
  name?: string;
}) {
  const style = { width: size, height: size };
  if (src) {
    return (
      <>
        <img
          src={src}
          alt={alt || name || "avatar"}
          className="rounded-full object-cover"
          style={style}
          onError={(e) => {
            // fallback sang chữ nếu ảnh lỗi
            const el = e.currentTarget;
            el.style.display = "none";
            const sib = el.nextElementSibling as HTMLDivElement | null;
            if (sib) sib.style.display = "flex";
          }}
        />
        <div
          className="rounded-full bg-gray-200 text-gray-700 items-center justify-center font-semibold select-none"
          style={{ ...style, display: "none" }}
        >
          {initialOf(name)}
        </div>
      </>
    );
  }
  return (
    <div
      className="rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-semibold select-none"
      style={style}
      aria-label={alt || name || "avatar"}
      title={name}
    >
      {initialOf(name)}
    </div>
  );
}

type Props = {
  courseId: string;
  selectedUserId?: string | null;
  onSelect: (user: ChatUser) => void;
};

export default function StudentsList({ courseId, selectedUserId, onSelect }: Props) {
  const { getUsersInCourse, loading } = useGetUsersInCourse();
  const [users, setUsers] = useState<ChatUser[]>([]);

  useEffect(() => {
  if (!courseId) return;
  (async () => {
    const res = (await getUsersInCourse(courseId)) as GetUsersInCourseResponse;
    const list = Array.isArray(res) ? res : res?.users ?? [];
    setUsers(list);
  })();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [courseId]);

  return (
    <aside className="col-span-12 md:col-span-6 lg:col-span-5 xl:col-span-4">
      <div className="border border-gray-200 rounded-xl bg-white">
        <div className="p-3 border-b border-gray-100">
          <div className="text-sm font-semibold">Class members</div>
          <div className="text-xs text-gray-500">Pick a user to start chatting</div>
        </div>

        <div className="max-h-[520px] overflow-y-auto divide-y">
          {loading && <div className="p-3 text-sm text-gray-500">Loading users…</div>}
          {!loading && users.length === 0 && (
            <div className="p-3 text-sm text-gray-500">No users found.</div>
          )}

          {users.map((u) => {
            const active = selectedUserId === u.id;
            return (
              <button
                key={u.id}
                onClick={() => onSelect(u)}
                className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${active ? "bg-gray-50" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center">
                    <AvatarCircle src={u.profilePictureUrl} name={u.fullName} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{u.fullName}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {u.email} {u.studentId ? `• ${u.studentId}` : ""}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

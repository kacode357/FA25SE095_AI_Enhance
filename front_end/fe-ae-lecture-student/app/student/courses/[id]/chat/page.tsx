// app/student/courses/[id]/chat/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";

import StudentsList from "./components/StudentsList";
import ChatWindow from "./components/ChatWindow";
import type { CourseChatUserItemResponse as ChatUser } from "@/types/chat/chat.response";
import { loadDecodedUser } from "@/utils/secure-user";

/* ===== Token helpers ===== */
const ACCESS_TOKEN_KEY = "accessToken";

function getAccessToken() {
  if (typeof window !== "undefined") {
    const ss = sessionStorage.getItem(ACCESS_TOKEN_KEY);
    if (ss) return ss; // rememberMe=false
  }
  const ck = Cookies.get(ACCESS_TOKEN_KEY); // rememberMe=true
  return ck || "";
}

/* Lấy đúng id từ user đã giải mã (không fallback) */
function extractUserId(u: unknown): string | null {
  if (!u || typeof u !== "object") return null;
  const v = (u as { id?: unknown }).id;
  return typeof v === "string" && v.length > 0 ? v : null;
}

export default function ChatPage() {
  const params = useParams();
  const courseId = useMemo(() => {
    const pid = (params as any).id;
    return Array.isArray(pid) ? (pid[0] as string) : (pid as string);
  }, [params]);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const user = await loadDecodedUser(); // đọc cookie/session "a:u"
      if (cancelled) return;
      setCurrentUserId(extractUserId(user));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="py-6 grid grid-cols-12 gap-6">
      <StudentsList
        courseId={courseId}
        selectedUserId={selectedUser?.id}
        onSelect={setSelectedUser}
      />

      <ChatWindow
        courseId={courseId}
        currentUserId={currentUserId}
        selectedUser={selectedUser}
        getAccessToken={getAccessToken}
      />
    </div>
  );
}

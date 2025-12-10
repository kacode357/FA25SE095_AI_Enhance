"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";

import StudentsList from "./components/StudentsList";
import ChatWindow from "./components/ChatWindow";
import type { CourseChatUserItemResponse as ChatUser } from "@/types/chat/chat.response";
import { loadDecodedUser } from "@/utils/secure-user";
import { CourseMiniHeader } from "../components/CourseMiniHeader";

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

type UnreadItem = { userId: string; unreadCount: number };

export default function ChatPage() {
  const params = useParams();
  const courseId = useMemo(() => {
    const pid = (params as any).id;
    return Array.isArray(pid) ? (pid[0] as string) : (pid as string);
  }, [params]);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);

  // Map userId -> unreadCount (nguồn: API + Hub)
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const user = await loadDecodedUser();
      if (cancelled) return;
      setCurrentUserId(extractUserId(user));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Seed unread từ API list (StudentsList gọi)
  const handleInitialUnreadLoaded = (items: UnreadItem[]) => {
    setUnreadMap((prev) => {
      const next = { ...prev };
      for (const it of items) {
        if (typeof next[it.userId] === "undefined") {
          next[it.userId] = it.unreadCount;
        }
      }
      return next;
    });
  };

  // Hub bắn từng user đổi unread
  const handleUnreadCountChanged = (p: UnreadItem) => {
    setUnreadMap((prev) => ({
      ...prev,
      [p.userId]: p.unreadCount,
    }));
  };

  // Hub bắn 1 batch unread (UnreadCounts)
  const handleUnreadCountsBatch = (items: UnreadItem[]) => {
    setUnreadMap((prev) => {
      const next = { ...prev };
      for (const it of items) {
        next[it.userId] = it.unreadCount;
      }
      return next;
    });
  };

  // Click vào 1 user bên trái
  const handleSelectUser = (user: ChatUser) => {
    setSelectedUser(user);

    // Optimistic clear unread (nhìn UI mượt)
    setUnreadMap((prev) => ({
      ...prev,
      [user.id]: 0,
    }));
  };

  return (
    <div className="py-6 space-y-4">
      <CourseMiniHeader section="Chat" />

      <div className="grid grid-cols-12 gap-6">
      <StudentsList
        courseId={courseId}
        selectedUserId={selectedUser?.id}
        onSelect={handleSelectUser}
        unreadMap={unreadMap}
        onInitialUnreadLoaded={handleInitialUnreadLoaded}
      />

      <ChatWindow
        courseId={courseId}
        currentUserId={currentUserId}
        selectedUser={selectedUser}
        getAccessToken={getAccessToken}
        onUnreadCountChanged={handleUnreadCountChanged}
        onUnreadCountsBatch={handleUnreadCountsBatch}
      />
      </div>
    </div>
  );
}

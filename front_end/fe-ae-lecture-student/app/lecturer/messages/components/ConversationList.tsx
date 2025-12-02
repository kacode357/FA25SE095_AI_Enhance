"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useGetConversations } from "@/hooks/chat/useGetConversations";
import { useChatHub } from "@/hooks/hubchat/useChatHub";
import { cn } from "@/lib/utils";
import type { ConversationItemResponse } from "@/types/chat/chat.response";
import { getSavedAccessToken } from "@/utils/auth/access-token";
import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Props = {
  selectedId?: string | null;
  onSelect: (conv: ConversationItemResponse) => void;
  courseIdFilter?: string;
};

export default function ConversationList({
  selectedId,
  onSelect,
  courseIdFilter,
}: Props) {
  const { getConversations, loading } = useGetConversations();
  const [conversations, setConversations] = useState<ConversationItemResponse[]>([]);
  const [keyword, setKeyword] = useState("");
  const autoSelectedRef = useRef(false);
  const onSelectRef = useRef(onSelect);
  const selectedIdRef = useRef(selectedId);

  // Ensure IDs and user fields are normalized to strings so we don't
  // end up with duplicates when server sometimes returns numbers.
  function normalizeConversation(it: any): ConversationItemResponse {
    const otherUserId = String(it?.otherUserId ?? it?.userId ?? "");
    const courseId = String(it?.courseId ?? "");
    // Prefer server id when present, but always store as string.
    // Fallback key uses otherUserId + courseId to remain stable.
    const id = String(it?.id ?? `${otherUserId}-${courseId}`);
    return {
      ...it,
      id,
      otherUserId,
      courseId,
      unreadCount: Number(it?.unreadCount ?? 0),
    } as ConversationItemResponse;
  }

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  const handleSelect = (conv: ConversationItemResponse) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
    );
    onSelect(conv);
  };

  useEffect(() => {
    let mounted = true;
    // allow auto-select for this fetch (reset when course filter changes)
    autoSelectedRef.current = false;
    (async () => {
      const res = await getConversations(
        courseIdFilter ? { courseId: courseIdFilter } : undefined
      );
      if (mounted && res) {
        const normalized = Array.isArray(res)
          ? res
          : Array.isArray((res as any)?.conversations)
            ? (res as any).conversations
            : Array.isArray((res as any)?.items)
              ? (res as any).items
              : [];

        // Merge with existing conversations using a stable string id
        // to avoid duplicates when ids come back as numbers/strings.
        const incoming = (normalized as ConversationItemResponse[]).map(normalizeConversation);
        setConversations((prev) => {
          const byId = new Map<string, ConversationItemResponse>(
            prev.map((c) => [String(c.id), normalizeConversation(c)])
          );
          for (const it of incoming) {
            byId.set(String(it.id), it);
          }
          return Array.from(byId.values());
        });

          // Auto-select first conversation when none is selected yet.
          // Do this after updating state to avoid calling parent setState during render.
          if (!selectedIdRef.current && incoming.length > 0 && !autoSelectedRef.current) {
            autoSelectedRef.current = true;
            const first = incoming[0];
            // schedule on next microtask to avoid setState-in-render warning
            Promise.resolve().then(() => {
              try {
                onSelectRef.current?.(first);
              } catch {
                // ignore
              }
            });
          }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [courseIdFilter]);

  // Hub: update unread counts in realtime
  const handleUnreadChanged = useCallback(
    (p: { userId: string; unreadCount: number }) => {
      if (!p?.userId) return;
      setConversations((prev) => {
        const matches = prev.filter((c) => String(c.otherUserId) === String(p.userId));
        // If only one conversation matches this user, update it directly.
        if (matches.length <= 1) {
          return prev.map((c) =>
            String(c.otherUserId) === String(p.userId)
              ? { ...c, unreadCount: Number(p.unreadCount || 0) }
              : c,
          );
        }

        // Multiple conversations share the same otherUserId.
        // If the UI is currently filtered by course, update only that course's conversation.
        if (courseIdFilter) {
          return prev.map((c) =>
            String(c.otherUserId) === String(p.userId) && String(c.courseId) === String(courseIdFilter)
              ? { ...c, unreadCount: Number(p.unreadCount || 0) }
              : c,
          );
        }

        // Otherwise, avoid applying the same unreadCount to all duplicates.
        // Trigger a lightweight refresh to get accurate per-conversation counts.
        // We return prev as-is for now; the refresh will merge the correct values.
        Promise.resolve()
          .then(async () => {
            const res = await getConversations(undefined);
            const normalized = Array.isArray(res)
              ? res
              : Array.isArray((res as any)?.conversations)
                ? (res as any).conversations
                : Array.isArray((res as any)?.items)
                  ? (res as any).items
                  : [];
            const incoming = (normalized as ConversationItemResponse[]).map(normalizeConversation);
            setConversations((cur) => {
              const byId = new Map<string, ConversationItemResponse>(
                cur.map((c) => [String(c.id), normalizeConversation(c)])
              );
              for (const it of incoming) byId.set(String(it.id), it);
              return Array.from(byId.values());
            });
          })
          .catch(() => {
            /* ignore refresh errors */
          });

        return prev;
      });
    },
    [courseIdFilter, getConversations],
  );

  const handleUnreadBatch = useCallback(
    (items: Array<{ userId: string; unreadCount: number }>) => {
      if (!Array.isArray(items) || items.length === 0) return;
      setConversations((prev) => {
        // Detect if there are duplicates by otherUserId
        const dupUserIds = new Set<string>();
        const seen = new Set<string>();
        for (const c of prev) {
          const uid = String(c.otherUserId);
          if (seen.has(uid)) dupUserIds.add(uid);
          else seen.add(uid);
        }

        // If no duplicates, update straightforwardly
        if (dupUserIds.size === 0) {
          return prev.map((c) => {
            const hit = items.find((it) => String(it.userId) === String(c.otherUserId));
            return hit ? { ...c, unreadCount: Number(hit.unreadCount || 0) } : c;
          });
        }

        // With duplicates present, restrict updates to the filtered course when available
        if (courseIdFilter) {
          return prev.map((c) => {
            const hit = items.find((it) => String(it.userId) === String(c.otherUserId));
            if (!hit) return c;
            return String(c.courseId) === String(courseIdFilter)
              ? { ...c, unreadCount: Number(hit.unreadCount || 0) }
              : c;
          });
        }

        // Otherwise refresh conversations to fetch accurate per-conversation counts
        Promise.resolve()
          .then(async () => {
            const res = await getConversations(undefined);
            const normalized = Array.isArray(res)
              ? res
              : Array.isArray((res as any)?.conversations)
                ? (res as any).conversations
                : Array.isArray((res as any)?.items)
                  ? (res as any).items
                  : [];
            const incoming = (normalized as ConversationItemResponse[]).map(normalizeConversation);
            setConversations((cur) => {
              const byId = new Map<string, ConversationItemResponse>(
                cur.map((c) => [String(c.id), normalizeConversation(c)])
              );
              for (const it of incoming) byId.set(String(it.id), it);
              return Array.from(byId.values());
            });
          })
          .catch(() => {
            /* ignore refresh errors */
          });

        return prev;
      });
    },
    [courseIdFilter, getConversations],
  );

  const { user } = useAuth();

  const { connect, disconnect } = useChatHub({
    getAccessToken: () => getSavedAccessToken() ?? "",
    onUnreadCountChanged: handleUnreadChanged,
    onUnreadCountsBatch: handleUnreadBatch,
    onError: (m) => {
      console.warn("[ConversationList][ChatHub] onError:", m);
    },
  });

  const startedRef = useRef(false);
  const disconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // auto connect if token exists and user is present
    if (!user?.id) return;
    const token = getSavedAccessToken();
    if (!token) return;
    let cancelled = false;

    // clear any previously scheduled disconnect (if reconnecting quickly)
    if (disconnectTimerRef.current) {
      clearTimeout(disconnectTimerRef.current);
      disconnectTimerRef.current = null;
    }

    // Fire-and-forget connect to avoid cleanup/start race
    connect().catch(() => {
      /* ignore connect errors here */
    });

    return () => {
      cancelled = true;
      // schedule a delayed disconnect instead of immediate stop() to avoid stop/start race
      if (disconnectTimerRef.current) clearTimeout(disconnectTimerRef.current);
      disconnectTimerRef.current = setTimeout(() => {
        void disconnect();
        disconnectTimerRef.current = null;
      }, 2000);
    };
  }, [user?.id, connect, disconnect]);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return conversations;
    return conversations.filter((c) =>
      [c.otherUserName, c.courseName, c.lastMessagePreview]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(kw))
    );
  }, [conversations, keyword]);

  return (
    <Card className="h-full gap-0 w-full flex flex-col border-slate-200 p-3 rounded-xl shadow-sm">
      {/* Search Box */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search conversations..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="pl-10 text-sm rounded-lg bg-slate-50 border-slate-200 focus-visible:ring-1 focus-visible:ring-violet-500"
        />
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1 min-h-0">
        <ul className="space-y-2 ">
          {loading && conversations.length === 0 ? (
            <li className="text-sm text-slate-400 p-2">Loading...</li>
          ) : filtered.length === 0 ? (
            <li className="text-sm text-slate-400 p-2">No conversation.</li>
          ) : (
            filtered.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => handleSelect(c)}
                  className={cn(
                    "w-full text-left p-3 mt-1 rounded-xl cursor-pointer transition flex items-center gap-3 group border border-transparent",
                    "hover:bg-violet-50 hover:border-violet-100",
                    selectedId === c.id &&
                    "bg-violet-100 border-violet-300 shadow-sm"
                  )}
                >
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full bg-violet-200 text-violet-700 flex items-center justify-center font-semibold">
                    {(c.otherUserName || "?").trim().charAt(0).toUpperCase()}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm line-clamp-1">
                        {c.otherUserName}
                      </span>

                      {c.unreadCount ? (
                        <Badge
                          variant="secondary"
                          className="bg-violet-600 text-white text-[10px] px-2 py-0.5 rounded-full"
                        >
                          {c.unreadCount}
                        </Badge>
                      ) : null}
                    </div>

                    <span
                      className={cn(
                        "text-xs mt-1 block line-clamp-1",
                        c.unreadCount
                          ? "font-medium text-slate-800"
                          : "text-slate-500"
                      )}
                    >
                      {c.unreadCount > 0
                        ? `${c.unreadCount} new message${c.unreadCount > 1 ? "s" : ""}`
                        : c.lastMessagePreview ?? "No messages yet."}
                    </span>
                  </div>
                </button>
              </li>
            ))
          )}
        </ul>
      </ScrollArea>
    </Card>
  );
}

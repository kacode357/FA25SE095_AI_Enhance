"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useGetConversations } from "@/hooks/chat/useGetConversations";
import { cn } from "@/lib/utils";
import type { ConversationItemResponse } from "@/types/chat/chat.response";
import { useEffect, useMemo, useState } from "react";

type Props = {
  selectedId?: string | null;
  onSelect: (conv: ConversationItemResponse) => void;
  courseIdFilter?: string;
};

export default function ConversationList({ selectedId, onSelect, courseIdFilter }: Props) {
  const { getConversations, loading } = useGetConversations();
  const [conversations, setConversations] = useState<ConversationItemResponse[]>([]);
  const [keyword, setKeyword] = useState("");

  const handleSelect = (conv: ConversationItemResponse) => {
    // Optimistically mark conversation as read locally when user opens it.
    setConversations((prev) => prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c)));
    onSelect(conv);
  };

  useEffect(() => {
    let mounted = true;
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
        setConversations(normalized as ConversationItemResponse[]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [courseIdFilter]);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    const base = Array.isArray(conversations) ? conversations : [];
    if (!kw) return base;
    return base.filter((c) =>
      [c.otherUserName, c.courseName, c.lastMessagePreview]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(kw))
    );
  }, [conversations, keyword]);

  return (
    <Card className="h-full w-full min-w-0 flex flex-col border-slate-300 gap-1 p-2">
      <Input
        placeholder="Search by name, course..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="text-sm"
      />
      <Separator />
      <ScrollArea className="flex-1 min-h-0">
        <div className="h-full flex flex-col">
          <ul className="space-y-4 flex-1">
            {loading && conversations.length === 0 ? (
              <li className="text-sm text-muted-foreground p-2">Loading...</li>
            ) : !Array.isArray(filtered) || filtered.length === 0 ? (
              <li className="text-sm text-muted-foreground p-2">No conversation.</li>
            ) : (
              filtered.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => handleSelect(c)}
                    className={cn(
                      "w-full text-left rounded-l-full  cursor-pointer hover:bg-slate-100 hover:rounded-full transition",
                      selectedId === c.id && "bg-slate-100 rounded-full"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-15 h-15 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-medium">{(c.otherUserName || "?").trim().charAt(0).toUpperCase()}</div>
                        </div>
                        <div className="flex gap-1 flex-col">
                          <div className="font-medium line-clamp-1">{c.otherUserName}</div>
                          {typeof c.unreadCount === "number" && c.unreadCount > 0 ? (
                            <div className="text-xs text-slate-800 mt-1">{c.unreadCount} tin nhắn mới</div>
                          ) : (
                            <div className="text-xs text-slate-500 line-clamp-1 mt-1">{c.lastMessagePreview ?? "No messages yet."}</div>
                          )}
                        </div>
                      </div>
                      {/* {c.courseName ? (
                        <div className="text-[10px] text-muted-foreground ml-2 p-1 line-clamp-1">
                          {c.courseName}
                        </div>
                      ) : null} */}
                    </div>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </ScrollArea>
    </Card>
  );
}

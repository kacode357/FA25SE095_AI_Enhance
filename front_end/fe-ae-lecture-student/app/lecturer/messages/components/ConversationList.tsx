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
          <ul className="space-y-1 pr-2 flex-1">
            {loading && conversations.length === 0 ? (
              <li className="text-sm text-muted-foreground p-2">Loading...</li>
            ) : !Array.isArray(filtered) || filtered.length === 0 ? (
              <li className="text-sm text-muted-foreground p-2">No conversation.</li>
            ) : (
              filtered.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => onSelect(c)}
                    className={cn(
                      "w-full text-left p-2 rounded cursor-pointer hover:bg-slate-100 hover:rounded-lg transition",
                      selectedId === c.id && "bg-muted"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium line-clamp-1">{c.otherUserName}</div>
                      {c.courseName ? (
                        <div className="text-xs text-muted-foreground ml-2 line-clamp-1">
                          {c.courseName}
                        </div>
                      ) : null}
                    </div>
                    <div className="text-xs text-slate-500 text-muted-foreground line-clamp-1">
                      {c.lastMessagePreview ?? "No messages yet."}
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

"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useGetConversationMessages } from "@/hooks/chat/useGetConversationMessages";
import { cn, formatVNDateTime } from "@/lib/utils";
import { ChatService } from "@/services/chat.services";
import type { ChatMessageItemResponse, ConversationItemResponse } from "@/types/chat/chat.response";
import { MessageCircle, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Props = {
  conversation?: ConversationItemResponse | null;
};

export default function MessageThread({ conversation }: Props) {
  const { user } = useAuth();
  const { getConversationMessages, loading } = useGetConversationMessages();
  const [messages, setMessages] = useState<ChatMessageItemResponse[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 30;

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!conversation?.id) {
        setMessages([]);
        setPageNumber(1);
        return;
      }
      const res = await getConversationMessages(conversation.id, { pageNumber: 1, pageSize });
      if (mounted && res) {
        // some APIs return { messages: [...] } or an array — normalize to array
        const arr = Array.isArray(res) ? res : (res && (res as any).messages) ? (res as any).messages : [];
        setMessages(arr);
        setPageNumber(1);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.id]);

  const hasMore = useMemo(() => messages.length > 0 && messages.length % pageSize === 0, [messages.length]);

  async function loadMore() {
    if (!conversation?.id) return;
    const next = pageNumber + 1;
    const res = await getConversationMessages(conversation.id, { pageNumber: next, pageSize });
    const arr = Array.isArray(res) ? res : (res && (res as any).messages) ? (res as any).messages : [];
    if (arr && arr.length > 0) {
      setMessages((prev) => [...prev, ...arr]);
      setPageNumber(next);
    }
  }

  async function handleDelete(id: string) {
    await ChatService.deleteMessage(id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }

  if (!conversation) {
    return (
      <Card className="h-full flex items-center border-slate-300 text-slate-500 justify-center text-sm text-muted-foreground">
        <span className="text-slate-500">Select a conversation to view messages.</span>
      </Card>
    );
  }

  return (
    <Card className="h-full flex border-slate-300 -py-6 flex-col">
      {/* Header: align with SupportChatPage */}
      <div className="flex items-center justify-between border-b border-slate-300 px-3 py-2">
        <div className="flex items-start gap-3 py-2">
          <MessageCircle className="h-5 w-5 text-[var(--brand)] mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-nav">Support conversation</div>
            <div className="text-xs text-[var(--text-muted)]">Chat with <span className="font-medium">{conversation.otherUserName}</span></div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-3 space-y-3">
            {loading && messages.length === 0 ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : messages.length === 0 ? (
              <div className="text-sm text-muted-foreground">No messages yet.</div>
            ) : (
              <>
                {hasMore && (
                  <div className="flex justify-center">
                    <Button variant="outline" size="sm" onClick={loadMore} disabled={loading}>
                      Load more
                    </Button>
                  </div>
                )}
                {messages.map((m) => {
                  const mine = m.senderId === user?.id;
                  return (
                    <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[70%] rounded px-3 py-2",
                        mine ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        <div className="text-xs opacity-80 mb-1">
                          {mine ? "Bạn" : m.senderName} • {formatVNDateTime(m.sentAt)}
                        </div>
                        <div className="whitespace-pre-wrap break-words">{m.message}</div>
                        {!mine && m.isDeleted && (
                          <div className="text-[10px] italic opacity-60 mt-1">Deleted messages</div>
                        )}
                        {mine && (
                          <div className="mt-2 flex justify-end">
                            <Button
                              variant="secondary"
                              size="xs"
                              onClick={() => handleDelete(m.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* composer area (visual only: sending not supported here) */}
      <Separator />
      <div className="sticky bottom-0 bg-[var(--card)] border-t border-[var(--border)] px-4 py-3 z-10">
        <div className="flex items-center gap-2">
          <textarea
            className="input flex-1 resize-none rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:ring-0"
            rows={2}
            placeholder="Type a message… (Sending disabled in this view)"
            disabled
          />
          <button
            disabled
            className="btn btn-gradient-slow h-9 px-4 text-xs font-semibold opacity-60 cursor-not-allowed"
          >
            Send
            <Send className="size-4 ml-2" />
          </button>
        </div>
      </div>
    </Card>
  );
}

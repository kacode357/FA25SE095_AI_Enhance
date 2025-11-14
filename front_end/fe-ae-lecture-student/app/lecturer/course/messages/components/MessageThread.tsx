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
        setMessages(res);
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
    if (res && res.length > 0) {
      setMessages((prev) => [...prev, ...res]);
      setPageNumber(next);
    }
  }

  async function handleDelete(id: string) {
    await ChatService.deleteMessage(id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }

  if (!conversation) {
    return (
      <Card className="h-full flex items-center justify-center text-sm text-muted-foreground">
        Select a conversation to view messages.
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="p-3 border-b flex items-center gap-2">
        <div className="font-semibold">{conversation.otherUserName}</div>
        {conversation.courseName ? (
          <div className="text-xs text-muted-foreground">• {conversation.courseName}</div>
        ) : null}
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

      <Separator />
      <div className="p-3 text-xs text-muted-foreground">
        Message history viewing interface (sending messages in this screen is not supported yet).
      </div>
    </Card>
  );
}

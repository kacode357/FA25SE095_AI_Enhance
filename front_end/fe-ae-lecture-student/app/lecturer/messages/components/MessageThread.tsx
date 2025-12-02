"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useGetConversationMessages } from "@/hooks/chat/useGetConversationMessages";
import { useChatHub } from "@/hooks/hubchat/useChatHub";
import { cn, formatVNDateTime } from "@/lib/utils";
import { ChatService } from "@/services/chat.services";
import type { ChatMessageItemResponse, ConversationItemResponse } from "@/types/chat/chat.response";
import { getSavedAccessToken } from "@/utils/auth/access-token";
import { MessageCircle, Send } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function isSameDay(a?: string | null, b?: string | null) {
  if (!a || !b) return false;
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

type Props = {
  conversation?: ConversationItemResponse | null;
};

export default function MessageThread({ conversation }: Props) {
  const { user } = useAuth();
  const { getConversationMessages, loading } = useGetConversationMessages();
  const [messages, setMessages] = useState<ChatMessageItemResponse[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 30;
  const pendingRef = useRef<Map<string, { createdAt: number; message: string; receiverId: string }>>(new Map());
  const conversationRef = useRef<ConversationItemResponse | null>(conversation ?? null);
  const userRef = useRef(user ?? null);

  useEffect(() => {
    conversationRef.current = conversation ?? null;
  }, [conversation]);

  useEffect(() => {
    userRef.current = user ?? null;
  }, [user]);

  const handleReceiveMessage = useCallback((msg: ChatMessageItemResponse) => {
    const conv = conversationRef.current;
    const currentUser = userRef.current;
    if (!conv) return;
    setMessages((prev) => {
      if (prev.find((m) => m.id === msg.id)) return prev;

      if (currentUser && msg.senderId === currentUser.id) {
        for (const [tempId, p] of pendingRef.current) {
          const within7s = Date.now() - p.createdAt <= 7000;
          if (within7s && p.receiverId === msg.receiverId && p.message === msg.message) {
            const next = prev.map((m) => (m.id === tempId ? msg : m));
            pendingRef.current.delete(tempId);
            return next.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
          }
        }
      }

      const next = [...prev, msg];
      return next.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
    });
  }, []);

  const handleReceiveMessagesBatch = useCallback((batch: ChatMessageItemResponse[]) => {
    const conv = conversationRef.current;
    if (!conv || !batch?.length) return;
    setMessages((prev) => {
      const byId = new Map(prev.map((m) => [m.id, m]));
      for (const it of batch) {
        if (!byId.has(it.id)) byId.set(it.id, it);
      }
      const next = Array.from(byId.values()).sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
      return next;
    });
  }, []);

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

  // Hub: connect when conversation present to receive/send realtime messages
  const { connect, disconnect, sendMessage } = useChatHub({
    getAccessToken: () => getSavedAccessToken() ?? "",
    onReceiveMessage: handleReceiveMessage,
    onReceiveMessagesBatch: handleReceiveMessagesBatch,
  });

  const disconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!conversation?.otherUserId) {
        // schedule a delayed disconnect to avoid racing with a connect()
        if (disconnectTimerRef.current) clearTimeout(disconnectTimerRef.current);
        disconnectTimerRef.current = setTimeout(() => {
          void disconnect();
          disconnectTimerRef.current = null;
        }, 2000);
        return;
      }

      // If a disconnect was scheduled from a previous unmount, cancel it — we're reconnecting quickly
      if (disconnectTimerRef.current) {
        clearTimeout(disconnectTimerRef.current);
        disconnectTimerRef.current = null;
      }

      // fire-and-forget connect to avoid cleanup/start race
      connect().catch(() => {
        /* ignore connect errors here */
      });
    })();

    return () => {
      cancelled = true;
      // schedule a delayed disconnect instead of immediate stop() to avoid stop/start race
      if (disconnectTimerRef.current) clearTimeout(disconnectTimerRef.current);
      disconnectTimerRef.current = setTimeout(() => {
        void disconnect();
        disconnectTimerRef.current = null;
      }, 2000);
    };
  }, [conversation?.otherUserId, connect, disconnect]);

  // send message
  const onSend = async () => {
    if (!conversation || !user?.id) return;
    const message = input.trim();
    if (!message) return;

    // optimistic local message
    const tempId = `temp-${Date.now()}`;
    const local = {
      id: tempId,
      senderId: user.id,
      senderName: user.fullName || "Me",
      receiverId: conversation.otherUserId,
      receiverName: conversation.otherUserName,
      message,
      sentAt: new Date().toISOString(),
      isDeleted: false,
    } as ChatMessageItemResponse;

    pendingRef.current.set(tempId, { createdAt: Date.now(), message, receiverId: conversation.otherUserId });
    setMessages((prev) => [...prev, local]);
    setInput("");

    try {
      setSending(true);
      const dto = {
        message,
        receiverId: conversation.otherUserId,
        courseId: conversation.courseId ?? "",
        conversationId: conversation.id,
      };
      await sendMessage(dto);
    } catch (err) {
      // ignore or show toast
      console.error("sendMessage failed", err);
    } finally {
      setSending(false);
    }
  };

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
                {messages.map((m, idx) => {
                  const mine = m.senderId === user?.id;
                  const prev = idx > 0 ? messages[idx - 1] : null;
                  const showDateSep = !prev || !isSameDay(prev.sentAt, m.sentAt);

                  return (
                    <div key={m.id}>
                      {showDateSep && (
                        <div className="w-full flex items-center my-3">
                          <div className="flex-1 h-px bg-slate-200" />
                          <div className="mx-3 text-[12px] text-slate-500 px-3 py-1 rounded-full border border-slate-100 bg-white">{formatVNDateTime(m.sentAt).split(',')[0] === new Date().toLocaleDateString() ? 'Today' : new Date(m.sentAt).toLocaleDateString()}</div>
                          <div className="flex-1 h-px bg-slate-200" />
                        </div>
                      )}

                      <div className={cn("flex mb-2 items-end", mine ? "justify-end" : "justify-start")}> 
                        <div className={cn(
                          mine ? "rounded-full bg-violet-500 text-white px-4 py-2 shadow" : "rounded-full bg-white border border-slate-200 text-slate-800 px-3 py-1",
                          "inline-block max-w-[60%] break-words"
                        )}>
                          <div className="text-[12px] leading-tight">{m.message}</div>
                        </div>
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
      <div className="sticky bottom-0 bg-[var(--card)] border-t border-[var(--border)] rounded-b-2xl px-4 py-3 z-10">
        <div className="flex items-center gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void onSend();
              }
            }}
            className="flex-1 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none"
            placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
            disabled={sending}
          />
          <button
            aria-label="Send message"
            disabled={sending || !input.trim()}
            onClick={() => void onSend()}
            className="h-9 px-4 text-xs font-semibold rounded-lg bg-gradient-to-r from-violet-400 to-violet-300 text-white disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}

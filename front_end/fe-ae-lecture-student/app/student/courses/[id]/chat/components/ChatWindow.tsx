// app/student/courses/[id]/chat/components/ChatWindow.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChatHub } from "@/hooks/hubchat/useChatHub";
import { useDeleteMessage } from "@/hooks/chat/useDeleteMessage";
import { useGetConversations } from "@/hooks/chat/useGetConversations";
import { useGetConversationMessages } from "@/hooks/chat/useGetConversationMessages";
import type { SendMessagePayload } from "@/types/chat/chat.payload";
import type {
  ChatMessageItemResponse as ChatMessage,
  CourseChatUserItemResponse as ChatUser,
} from "@/types/chat/chat.response";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/* ===== Utils ===== */
const cx = (...a: Array<string | false | undefined>) => a.filter(Boolean).join(" ");
const uuid = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `temp-${Date.now()}-${Math.round(Math.random() * 1e9)}`;

/** Parse datetime từ BE:
 * - Nếu thiếu timezone => coi là UTC, gắn 'Z'
 * - Clamp phần nghìn giây về 3 chữ số để Date parse ổn định
 */
function parseServerDate(ts: string): Date {
  if (!ts) return new Date(NaN);
  const clamped = ts.replace(/(\.\d{3})\d+$/, "$1");
  const hasTZ = /Z|[+\-]\d{2}:\d{2}$/.test(clamped);
  const iso = hasTZ ? clamped : clamped + "Z";
  return new Date(iso);
}

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const mins = (a: Date, b: Date) => Math.abs(a.getTime() - b.getTime()) / 60000;

const timeHHmm = (d: Date) =>
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

const dayLabel = (d: Date) => {
  const now = new Date();
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  if (sameDay(d, now)) return "Today";
  if (sameDay(d, y)) return "Yesterday";
  return `${String(d.getDate()).padStart(2, "0")} ${d.toLocaleString(undefined, {
    month: "short",
  })} ${d.getFullYear()}`;
};

const initial = (name?: string) => (name?.trim()?.[0]?.toUpperCase() ?? "?");

/* ===== Props ===== */
type Props = {
  courseId: string;
  currentUserId: string | null;
  selectedUser: ChatUser | null;
  getAccessToken: () => string;
};

export default function ChatWindow({
  courseId,
  currentUserId,
  selectedUser,
  getAccessToken,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [typingMap, setTypingMap] = useState<Record<string, boolean>>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  // scroll
  const listRef = useRef<HTMLDivElement | null>(null);
  const scrollBottom = () =>
    requestAnimationFrame(() => {
      if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    });

  // hooks
  const { getConversations, loading: loadingConvs } = useGetConversations();
  const { getConversationMessages, loading: loadingMsgs } = useGetConversationMessages();
  const { deleteMessage, loading: deleting } = useDeleteMessage();
  const loadingHistory = loadingConvs || loadingMsgs;

  // optimistic map
  const pendingRef = useRef<
    Map<string, { createdAt: number; message: string; receiverId: string }>
  >(new Map());

  // Hub
  const { connect, disconnect, sendMessage, startTyping, stopTyping, deleteMessageHub } =
    useChatHub({
      getAccessToken,
      onReceiveMessagesBatch: (batch) => {
        if (!batch?.length) return;
        setMessages((prev) => {
          const byId = new Map(prev.map((m) => [m.id, m]));
          for (const it of batch) {
            if (currentUserId && it.senderId === currentUserId) {
              // replace temp by server echo
              for (const [tempId, p] of pendingRef.current) {
                const within7s = Date.now() - p.createdAt <= 7000;
                if (
                  within7s &&
                  p.receiverId === it.receiverId &&
                  p.message === it.message &&
                  byId.has(tempId)
                ) {
                  byId.delete(tempId);
                  byId.set(it.id, it);
                  pendingRef.current.delete(tempId);
                  break;
                }
              }
              if (!byId.has(it.id)) byId.set(it.id, it);
            } else {
              byId.set(it.id, it);
            }
          }
          const next = Array.from(byId.values()).sort(
            (a, b) =>
              parseServerDate(a.sentAt).getTime() -
              parseServerDate(b.sentAt).getTime(),
          );
          return next.length > 500 ? next.slice(-500) : next;
        });
        scrollBottom();
      },
      onTyping: ({ userId, isTyping }) =>
        setTypingMap((prev) =>
          prev[userId] === isTyping ? prev : { ...prev, [userId]: isTyping },
        ),
      onMessageDeleted: (id) =>
        setMessages((prev) =>
          prev.map((m) =>
            m.id === id ? { ...m, isDeleted: true, message: "[deleted]" } : m,
          ),
        ),
      debounceMs: 500,
    });

  /* ===== Load history (normalize cả conversations & messages) ===== */
  const loadHistory = useRef(async (peerId: string) => {
    if (!courseId) return;

    // 1) Conversations
    const rawConvs: any = await getConversations({ courseId });
    const conversations = Array.isArray(rawConvs)
      ? rawConvs
      : rawConvs?.conversations ?? [];

    const conv =
      conversations.find(
        (c: any) => c.otherUserId === peerId && c.courseId === courseId,
      ) ??
      conversations.find((c: any) => c.otherUserId === peerId) ??
      null;

    if (!conv) {
      setMessages([]);
      return;
    }

    // 2) Messages
    const rawMsgs: any = await getConversationMessages(conv.id, {
      pageNumber: 1,
      pageSize: 50,
    });
    const msgs: ChatMessage[] = Array.isArray(rawMsgs)
      ? rawMsgs
      : rawMsgs?.messages ?? [];

    const sorted = msgs.sort(
      (a, b) =>
        parseServerDate(a.sentAt).getTime() -
        parseServerDate(b.sentAt).getTime(),
    );
    setMessages(sorted);
    scrollBottom();
  }).current;

  // connect & switch peer
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!selectedUser) {
        await disconnect();
        setMessages([]);
        pendingRef.current.clear();
        return;
      }
      try {
        await connect();
        if (!cancelled) await loadHistory(selectedUser.id);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser]);

  // typing edge-based
  const prevNonEmpty = useRef(false);
  useEffect(() => {
    if (!selectedUser) return;
    const nonEmpty = !!input.trim();
    if (!prevNonEmpty.current && nonEmpty) void startTyping(selectedUser.id);
    else if (prevNonEmpty.current && !nonEmpty) void stopTyping(selectedUser.id);
    prevNonEmpty.current = nonEmpty;
    return () => {
      if (prevNonEmpty.current && selectedUser) void stopTyping(selectedUser.id);
      prevNonEmpty.current = false;
    };
  }, [input, selectedUser, startTyping, stopTyping]);

  // send
  const onSend = async () => {
    if (!selectedUser || !courseId || !currentUserId) return;
    const message = input.trim();
    if (!message) return;

    const tempId = uuid();
    const local: ChatMessage = {
      id: tempId,
      senderId: currentUserId,
      senderName: "Me",
      receiverId: selectedUser.id,
      receiverName: selectedUser.fullName,
      message,
      sentAt: new Date().toISOString(),
      isDeleted: false,
    };
    pendingRef.current.set(tempId, {
      createdAt: Date.now(),
      message,
      receiverId: selectedUser.id,
    });
    setMessages((prev) => {
      const next = [...prev, local];
      return next.length > 500 ? next.slice(-500) : next;
    });
    scrollBottom();

    try {
      setSending(true);
      const dto: SendMessagePayload = {
        courseId,
        receiverId: selectedUser.id,
        message,
      };
      await sendMessage(dto);
      setInput("");
    } finally {
      setSending(false);
    }
  };

  // close menu on outside/Esc
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!openMenuId) return;
      const t = e.target as HTMLElement;
      const inTrig = !!t.closest(`[data-trigger-id="${openMenuId}"]`);
      const inMenu = !!t.closest(`[data-menu-id="${openMenuId}"]`);
      if (!inTrig && !inMenu) setOpenMenuId(null);
    };
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setOpenMenuId(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMenuId]);

  // confirm delete
  const onConfirmDelete = async () => {
    const id = confirmId;
    if (!id) return;
    setConfirmId(null);
    const isMine = !!messages.find(
      (m) => m.id === id && m.senderId === currentUserId,
    );
    if (!isMine || deleting) return;

    const ok = await deleteMessage(id);
    if (!ok) return;

    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, isDeleted: true, message: "[deleted]" } : m,
      ),
    );
    try {
      await deleteMessageHub(id);
    } catch {
      /* ignore */
    }
  };

  // render: day separators + clusters
  const rendered = useMemo(() => {
    const out: Array<
      | { kind: "sep"; id: string; label: string }
      | { kind: "msg"; m: ChatMessage; isMine: boolean; showTime: boolean }
    > = [];
    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      const d = parseServerDate(m.sentAt);
      if (i === 0 || !sameDay(parseServerDate(messages[i - 1].sentAt), d)) {
        out.push({
          kind: "sep",
          id: `sep-${d.toDateString()}`,
          label: dayLabel(d),
        });
      }
      const next = messages[i + 1];
      const showTime = !(
        next &&
        next.senderId === m.senderId &&
        mins(parseServerDate(next.sentAt), d) <= 5
      );
      const isMine = !!currentUserId && m.senderId === currentUserId;
      out.push({ kind: "msg", m, isMine, showTime });
    }
    return out;
  }, [messages, currentUserId]);

  const typingText =
    selectedUser && typingMap[selectedUser.id]
      ? `${selectedUser.fullName} is typing…`
      : "";

  return (
    <section className="col-span-12 md:col-span-6 lg:col-span-7 xl:col-span-8">
      <Card className="border-[var(--border)] bg-[var(--card)] h-[520px] flex flex-col shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
          {!selectedUser ? (
            <div className="text-xs font-medium text-[var(--text-muted)]">
              Select a user to start chatting
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border border-[var(--border)] shadow-sm">
                <AvatarImage
                  src={selectedUser.profilePictureUrl || undefined}
                  alt={selectedUser.fullName || "avatar"}
                />
                <AvatarFallback className="bg-[var(--background)] text-[var(--brand-700)] text-xs font-semibold">
                  {initial(selectedUser.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-nav truncate">
                  {selectedUser.fullName || "Unknown user"}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] truncate">
                  {selectedUser.email}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        {!selectedUser ? (
          <div className="flex flex-1 items-center justify-center px-6 py-4 text-xs text-[var(--text-muted)]">
            Pick someone on the left to start chatting.
          </div>
        ) : (
          <>
            <div
              ref={listRef}
              className="relative flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-stable"
            >
              {loadingHistory && (
                <div className="text-xs text-[var(--text-muted)]">
                  Loading history…
                </div>
              )}
              {!loadingHistory && messages.length === 0 && (
                <div className="text-xs text-[var(--text-muted)]">
                  No messages yet. Say hi!
                </div>
              )}

              {rendered.map((it) =>
                it.kind === "sep" ? (
                  <div key={it.id} className="relative my-3">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-[var(--border)]" />
                      <div className="rounded-full bg-[var(--background)] px-3 py-0.5 text-[10px] font-medium text-[var(--text-muted)] shadow-sm">
                        {it.label}
                      </div>
                      <div className="h-px flex-1 bg-[var(--border)]" />
                    </div>
                  </div>
                ) : (
                  <div
                    key={it.m.id}
                    className={cx(
                      "flex",
                      it.isMine ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cx(
                        "group relative w-fit max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                        it.isMine
                          ? "bg-[var(--brand)] text-white"
                          : "bg-white border border-[var(--border)] text-slate-900",
                      )}
                      title={
                        it.showTime
                          ? timeHHmm(parseServerDate(it.m.sentAt))
                          : undefined
                      }
                    >
                      {/* ⋮ menu */}
                      {it.isMine && !it.m.isDeleted && (
                        <div className="absolute left-[-30px] top-1/2 -translate-y-1/2">
                          <button
                            data-trigger-id={it.m.id}
                            className={cx(
                              "flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[11px] text-slate-700 transition-opacity shadow-sm",
                              openMenuId === it.m.id
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100",
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId((id) =>
                                id === it.m.id ? null : it.m.id,
                              );
                            }}
                            aria-label="Message actions"
                            aria-expanded={openMenuId === it.m.id}
                            title="More"
                          >
                            ⋮
                          </button>

                          {openMenuId === it.m.id && (
                            <div
                              data-menu-id={it.m.id}
                              className="absolute bottom-full left-1/2 z-50 mb-2 w-40 -translate-x-1/2 rounded-lg border border-[var(--border)] bg-white py-1 text-xs text-slate-700 shadow-xl"
                            >
                              <button
                                className="w-full px-3 py-1.5 text-left hover:bg-slate-50"
                                disabled={deleting}
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setConfirmId(it.m.id);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <div
                        className={cx(
                          "whitespace-pre-wrap break-words",
                          it.m.isDeleted && "italic opacity-70",
                        )}
                      >
                        {it.m.message}
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>

            {/* typing dưới input */}
            {typingText && (
              <div className="px-4 pt-1 text-[11px] text-[var(--text-muted)]">
                {typingText}
              </div>
            )}

            {/* composer */}
            <div className="border-t border-[var(--border)] px-4 py-3">
              <div className="flex items-end gap-2">
                <textarea
                  className="input flex-1 resize-none rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:ring-0"
                  rows={2}
                  placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void onSend();
                    }
                  }}
                />
                <button
                  onClick={onSend}
                  disabled={sending || !input.trim()}
                  className={cx(
                    "btn btn-gradient-slow h-9 px-4 text-xs font-semibold",
                    sending || !input.trim()
                      ? "opacity-60 cursor-not-allowed"
                      : "",
                  )}
                >
                  {sending ? "Sending…" : "Send"}
                </button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Confirm delete */}
      <AlertDialog
        open={!!confirmId}
        onOpenChange={(open) => !open && setConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this message?</AlertDialogTitle>
            <AlertDialogDescription>
              This action can’t be undone. The message will be marked as deleted
              for everyone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white"
              onClick={onConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

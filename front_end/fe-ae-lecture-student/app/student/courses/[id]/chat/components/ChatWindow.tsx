// app/student/courses/[id]/chat/components/ChatWindow.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChatHub } from "@/hooks/hubchat/useChatHub";
import { useDeleteMessage } from "@/hooks/chat/useDeleteMessage";
import { ChatService } from "@/services/chat.services";
import type { SendMessagePayload } from "@/types/chat/chat.payload";
import type {
  ChatMessageItemResponse as ChatMessageDto,
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

/* ========== utils ========== */
function clsx(...args: Array<string | false | undefined>) {
  return args.filter(Boolean).join(" ");
}
function uuid() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `temp-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function minutesDiff(a: Date, b: Date) {
  return Math.abs(a.getTime() - b.getTime()) / 60000;
}
function formatTime(d: Date) {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}
function formatDayLabel(d: Date) {
  const now = new Date();
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  if (isSameDay(d, now)) return "Today";
  if (isSameDay(d, y)) return "Yesterday";
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString(undefined, { month: "short" });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}
function initialOf(name?: string) {
  if (!name) return "?";
  const t = name.trim();
  return t ? t.charAt(0).toUpperCase() : "?";
}

/* Avatar with fallback letter */
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

/* ========== types ========== */
type Props = {
  courseId: string;
  currentUserId: string | null;
  selectedUser: ChatUser | null;
  getAccessToken: () => string;
};

type PendingInfo = {
  tempId: string;
  createdAt: number;
  message: string;
  receiverId: string;
};

export default function ChatWindow({ courseId, currentUserId, selectedUser, getAccessToken }: Props) {
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [typingUserIds, setTypingUserIds] = useState<Record<string, boolean>>({});
  const pendingRef = useRef<Map<string, PendingInfo>>(new Map());

  /* scroll */
  const listRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    if (!listRef.current) return;
    requestAnimationFrame(() => {
      listRef.current!.scrollTop = listRef.current!.scrollHeight;
    });
  };

  /* hub */
  const {
    connect,
    disconnect,
    sendMessage,
    startTyping,
    stopTyping,
    deleteMessageHub,
  } = useChatHub({
    getAccessToken,
    onReceiveMessagesBatch: (batch) => {
      if (!batch?.length) return;

      setMessages((prev) => {
        const byId = new Map(prev.map((m) => [m.id, m]));
        for (const incoming of batch) {
          if (currentUserId && incoming.senderId === currentUserId) {
            let replaced = false;
            for (const [tempId, p] of pendingRef.current) {
              const age = Date.now() - p.createdAt;
              if (
                p.receiverId === incoming.receiverId &&
                p.message === incoming.message &&
                age <= 7000 &&
                byId.has(tempId)
              ) {
                byId.delete(tempId);
                byId.set(incoming.id, incoming);
                pendingRef.current.delete(tempId);
                replaced = true;
                break;
              }
            }
            if (!replaced && !byId.has(incoming.id)) {
              byId.set(incoming.id, incoming);
            }
          } else {
            byId.set(incoming.id, incoming);
          }
        }
        const next = Array.from(byId.values()).sort(
          (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
        );
        return next.length > 500 ? next.slice(next.length - 500) : next;
      });

      scrollToBottom();
    },
    onTyping: ({ userId, isTyping }) => {
      setTypingUserIds((prev) => (prev[userId] === isTyping ? prev : { ...prev, [userId]: isTyping }));
    },
    onMessageDeleted: (messageId) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, isDeleted: true, message: "[deleted]" } : m))
      );
    },
    debounceMs: 500,
  });

  /* history */
  const loadHistory = useRef(async (userId: string) => {
    if (!courseId) return;
    setLoadingHistory(true);
    try {
      const conversations = await ChatService.getConversations({ courseId });
      const conv = conversations.find((c) => c.otherUserId === userId);
      if (!conv) {
        setMessages([]);
        return;
      }
      const msgs = await ChatService.getConversationMessages(conv.id, {
        pageNumber: 1,
        pageSize: 50,
      });
      setMessages(
        (msgs ?? []).sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())
      );
      scrollToBottom();
    } finally {
      setLoadingHistory(false);
    }
  }).current;

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
        if (cancelled) return;
        await loadHistory(selectedUser.id);
      } catch {
        // no-op
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser]);

  /* send */
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!selectedUser || !courseId || !currentUserId) return;
    const content = input.trim();
    if (!content) return;

    const dto: SendMessagePayload = {
      message: content,
      receiverId: selectedUser.id,
      courseId,
    };

    // optimistic temp
    const tempId = uuid();
    const localEcho: ChatMessageDto = {
      id: tempId,
      senderId: currentUserId,
      senderName: "Me",
      receiverId: selectedUser.id,
      receiverName: selectedUser.fullName,
      message: content,
      sentAt: new Date().toISOString(),
      isDeleted: false,
    };
    pendingRef.current.set(tempId, {
      tempId,
      createdAt: Date.now(),
      message: content,
      receiverId: selectedUser.id,
    });

    setMessages((prev) => {
      const next = [...prev, localEcho];
      return next.length > 500 ? next.slice(next.length - 500) : next;
    });
    scrollToBottom();

    try {
      setSending(true);
      await sendMessage(dto);
      setInput(""); // trigger StopTyping via effect
    } finally {
      setSending(false);
    }
  };

  /* typing edge-based */
  const prevNonEmptyRef = useRef<boolean>(false);
  useEffect(() => {
    if (!selectedUser) return;
    const nonEmpty = !!input.trim();
    const prev = prevNonEmptyRef.current;

    if (!prev && nonEmpty) {
      void startTyping(selectedUser.id);
    } else if (prev && !nonEmpty) {
      void stopTyping(selectedUser.id);
    }

    prevNonEmptyRef.current = nonEmpty;

    return () => {
      if (prevNonEmptyRef.current && selectedUser) {
        void stopTyping(selectedUser.id);
        prevNonEmptyRef.current = false;
      }
    };
  }, [input, selectedUser, startTyping, stopTyping]);

  const someoneTyping =
    selectedUser && typingUserIds[selectedUser.id] ? `${selectedUser.fullName} is typing…` : "";

  /* delete UX with shadcn confirm */
  const { deleteMessage, loading: deleting } = useDeleteMessage();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  // Close menu on outside click or ESC
  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!openMenuId) return;
      const target = e.target as HTMLElement;
      const inTrigger = !!target.closest(`[data-trigger-id="${openMenuId}"]`);
      const inMenu = !!target.closest(`[data-menu-id="${openMenuId}"]`);
      if (!inTrigger && !inMenu) setOpenMenuId(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenMenuId(null);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMenuId]);

  const handleConfirmDelete = async () => {
    const id = confirmId;
    if (!id) return;
    setConfirmId(null);
    const isMine = !!messages.find((m) => m.id === id && m.senderId === currentUserId);
    if (!isMine || deleting) return;

    // REST
    const success = await deleteMessage(id);
    if (!success) return;

    // local
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isDeleted: true, message: "[deleted]" } : m))
    );

    // broadcast
    try {
      await deleteMessageHub(id);
    } catch {
      // ignore
    }
  };

  /* ====== render helpers: day separators + cluster times ====== */
  const rendered = useMemo(() => {
    const out: Array<
      | { kind: "separator"; id: string; label: string; date: Date }
      | { kind: "msg"; data: ChatMessageDto; clusterEnd: boolean; isMine: boolean }
    > = [];

    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      const d = new Date(m.sentAt);
      if (i === 0 || !isSameDay(new Date(messages[i - 1].sentAt), d)) {
        out.push({ kind: "separator", id: `sep-${d.toDateString()}`, label: formatDayLabel(d), date: d });
      }

      const next = messages[i + 1];
      let clusterEnd = true;
      if (next) {
        const sameSender = next.senderId === m.senderId;
        const closeInTime = minutesDiff(new Date(next.sentAt), d) <= 5;
        clusterEnd = !(sameSender && closeInTime);
      }
      const isMine = !!currentUserId && m.senderId === currentUserId;
      out.push({ kind: "msg", data: m, clusterEnd, isMine });
    }
    return out;
  }, [messages, currentUserId]);

  return (
    <section className="col-span-12 md:col-span-6 lg:col-span-7 xl:col-span-8">
      <div className="border border-gray-200 rounded-xl bg-white h-[640px] flex flex-col">
        {/* Header: avatar + name only */}
        <div className="p-3 border-b border-gray-100">
          {!selectedUser ? (
            <div className="text-sm text-gray-500">Select a user to start.</div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="relative flex items-center">
                <AvatarCircle src={selectedUser.profilePictureUrl} name={selectedUser.fullName} />
              </div>
              <div className="min-w-0">
                <div className="font-medium truncate">{selectedUser.fullName}</div>
              </div>
            </div>
          )}
        </div>

        {!selectedUser ? (
          <div className="p-6 text-sm text-gray-500">Pick someone on the left to start chatting.</div>
        ) : (
          <>
            <div ref={listRef} className="relative flex-1 overflow-y-auto p-4 space-y-3">
              {loadingHistory && <div className="text-sm text-gray-500">Loading history…</div>}
              {!loadingHistory && messages.length === 0 && (
                <div className="text-sm text-gray-500">No messages yet. Say hi!</div>
              )}

              {rendered.map((item) => {
                if (item.kind === "separator") {
                  // z-10; menu z-50 sẽ đè lên
                  return (
                    <div key={item.id} className="sticky top-0 z-10">
                      <div className="my-4 flex items-center gap-3">
                        <div className="h-px flex-1 bg-gray-200" />
                        <div className="text-xs text-gray-500">{item.label}</div>
                        <div className="h-px flex-1 bg-gray-200" />
                      </div>
                    </div>
                  );
                }

                const m = item.data;
                const isMine = item.isMine;
                const showTime = item.clusterEnd;
                const dt = new Date(m.sentAt);
                const bubbleTitle = showTime ? formatTime(dt) : undefined; // tooltip HH:MM

                return (
                  <div className={clsx(isMine ? "flex justify-end" : "flex justify-start")} key={m.id}>
                    <div
                      className={clsx(
                        "group relative w-fit max-w-[75%] rounded-2xl px-3 py-2 text-sm",
                        isMine ? "bg-black text-white" : "bg-gray-100"
                      )}
                      title={bubbleTitle}
                    >
                      {/* ⋮ & menu: chỉ người gửi */}
                      {isMine && !m.isDeleted && (
                        <div className="absolute left-[-28px] top-1/2 -translate-y-1/2">
                          <button
                            data-trigger-id={m.id}
                            className={clsx(
                              "w-6 h-6 rounded-full border border-gray-300 bg-white text-gray-700 flex items-center justify-center transition-opacity",
                              openMenuId === m.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId((id) => (id === m.id ? null : m.id));
                            }}
                            aria-label="Message actions"
                            aria-expanded={openMenuId === m.id}
                            title="More"
                          >
                            <span className="leading-none">⋮</span>
                          </button>

                          {openMenuId === m.id && (
                            // z-50 để đè "Today"
                            <div
                              data-menu-id={m.id}
                              className={clsx(
                                "absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50",
                                "w-44 rounded-lg border border-gray-200 bg-white shadow-lg text-gray-700 text-sm py-1"
                              )}
                            >
                              <button
                                className="w-full text-left px-3 py-2 hover:bg-gray-50"
                                disabled={deleting}
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setConfirmId(m.id);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <div className={clsx("whitespace-pre-wrap break-words", m.isDeleted && "italic opacity-70")}>
                        {m.message}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* typing indicator: dời xuống ngay trên input */}
            {selectedUser && someoneTyping && (
              <div className="px-4 pt-1 text-xs text-gray-500">{someoneTyping}</div>
            )}

            {/* composer */}
            <div className="p-3 border-t border-gray-100">
              <div className="flex items-end gap-2">
                <textarea
                  className="flex-1 resize-none rounded-lg border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-200"
                  rows={2}
                  placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !input.trim()}
                  className={clsx(
                    "px-4 py-2 rounded-lg text-sm",
                    sending || !input.trim()
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-black text-white"
                  )}
                >
                  {sending ? "Sending…" : "Send"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Confirm delete */}
      <AlertDialog open={!!confirmId} onOpenChange={(open) => !open && setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this message?</AlertDialogTitle>
            <AlertDialogDescription>
              This action can’t be undone. The message will be marked as deleted for everyone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

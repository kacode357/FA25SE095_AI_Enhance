// app/student/courses/[id]/support/[conversationId]/page.tsx
"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

import { useAuth } from "@/contexts/AuthContext";
import { useChatHub } from "@/hooks/hubchat/useChatHub";
import { useGetConversationMessages } from "@/hooks/chat/useGetConversationMessages";
import { useResolveSupportRequest } from "@/hooks/support-requests/useResolveSupportRequest";

import type { SendMessagePayload } from "@/types/chat/chat.payload";
import type { ChatMessageItemResponse as ChatMessage } from "@/types/chat/chat.response";

import { getSavedAccessToken } from "@/utils/auth/access-token";

import { ArrowLeft, MessageCircle } from "lucide-react";
import ResolveSupportRequestDialog from "@/app/student/courses/[id]/support/components/ResolveSupportRequestDialog";

// ⭐ time utils dùng chung với ChatWindow
import {
  parseServerDate,
  timeHHmm,
  buildChatTimeline,
  ChatTimelineItem,
} from "@/utils/chat/time";

// ⭐ hook xoá message dùng chung
import { useChatDeleteMessage } from "@/hooks/chat/useChatDeleteMessage";

/* ===== Utils ===== */
const cx = (...a: Array<string | false | undefined>) =>
  a.filter(Boolean).join(" ");

/** Generate temp id cho optimistic message */
const uuid = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `temp-${Date.now()}-${Math.round(Math.random() * 1e9)}`;

const initial = (name?: string) =>
  name?.trim()?.[0]?.toUpperCase() ?? "?";

/* ===== Page ===== */
export default function SupportChatPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const courseId = useMemo(() => {
    const id = params?.id;
    return typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";
  }, [params]);

  const conversationId = useMemo(() => {
    const cid = (params as any)?.conversationId;
    return typeof cid === "string" ? cid : Array.isArray(cid) ? cid[0] : "";
  }, [params]);

  const peerId = searchParams.get("peerId");
  const peerName = searchParams.get("peerName") ?? "Support Staff";

  // Lấy supportRequestId từ URL (?requestId=... hoặc ?supportRequestId=...)
  const supportRequestId = useMemo(() => {
    return (
      searchParams.get("requestId") ??
      searchParams.get("supportRequestId") ??
      null
    );
  }, [searchParams]);

  const currentUserId = user?.id ?? null;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [typingMap, setTypingMap] = useState<Record<string, boolean>>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // trạng thái cho confirm "Has your need been resolved?"
  const { resolveSupportRequest, loading: resolving } =
    useResolveSupportRequest();
  const [resolveHandled, setResolveHandled] = useState(false);
  const [isResolved, setIsResolved] = useState(false); // sau khi confirm resolved thì khóa chat

  // read-only từ BE
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [readOnlyReason, setReadOnlyReason] = useState<string | null>(null);

  // flag tổng khóa chat
  const chatLocked = isResolved || isReadOnly;

  // đã load history thành công 1 lần cho conversation + supportRequest hiện tại chưa
  const [loadedOnce, setLoadedOnce] = useState(false);

  // scroll
  const listRef = useRef<HTMLDivElement | null>(null);
  const scrollBottom = () =>
    requestAnimationFrame(() => {
      if (listRef.current)
        listRef.current.scrollTop = listRef.current.scrollHeight;
    });

  const { getConversationMessages, loading: loadingMsgs } =
    useGetConversationMessages();
  const loadingHistory = loadingMsgs;

  // optimistic map
  const pendingRef = useRef<
    Map<string, { createdAt: number; message: string; receiverId: string }>
  >(new Map());

  // Hub
  const {
    connect,
    sendMessage,
    startTyping,
    stopTyping,
    deleteMessageHub,
  } = useChatHub({
    getAccessToken: () => getSavedAccessToken() ?? "",
    onReceiveMessagesBatch: (batch) => {
      if (!batch?.length) return;
      setMessages((prev) => {
        const byId = new Map(prev.map((m) => [m.id, m]));

        for (const it of batch) {
          if (currentUserId && it.senderId === currentUserId) {
            // replace temp message bằng server echo nếu match
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

  // ⭐ hook xoá message dùng chung (confirm dialog + call BE + hub)
  const { requestDelete, ConfirmDialog, deleting } = useChatDeleteMessage({
    currentUserId,
    setMessages,
    deleteMessageHub: (id) => deleteMessageHub(id),
  });

  /* ===== Reset khi đổi conversation / supportRequest ===== */
  useEffect(() => {
    // đổi conv hoặc supportRequest -> chuẩn bị load lại
    setLoadedOnce(false);
    setResolveHandled(false);
    setIsResolved(false);
    setIsReadOnly(false);
    setReadOnlyReason(null);
    setMessages([]);
    pendingRef.current.clear();
  }, [conversationId, supportRequestId, peerId]);

  /* ===== Load history: chỉ gọi API khi chưa loadedOnce ===== */
  const loadHistory = useCallback(
    async (convId: string, supportReqId?: string | null) => {
      const res = await getConversationMessages(convId, {
        pageNumber: 1,
        pageSize: 50,
        ...(supportReqId ? { supportRequestId: supportReqId } : {}),
      });
      if (!res) return;

      const msgs: ChatMessage[] = res.messages ?? [];
      const sorted = msgs.sort(
        (a, b) =>
          parseServerDate(a.sentAt).getTime() -
          parseServerDate(b.sentAt).getTime(),
      );
      setMessages(sorted);
      scrollBottom();

      // cập nhật trạng thái read-only từ BE
      setIsReadOnly(res.isReadOnly);
      setReadOnlyReason(res.readOnlyReason ?? null);

      // nếu server nói conversation đã đóng thì không cần show dialog “Has your need been resolved?”
      if (res.isReadOnly) {
        setResolveHandled(true);
        setIsResolved(true); // cũng coi như đã resolved để UI đồng bộ
      }

      // ✅ đánh dấu đã load thành công
      setLoadedOnce(true);
    },
    [getConversationMessages],
  );

  useEffect(() => {
    if (!peerId || !conversationId) return;
    if (loadedOnce) return; // ✅ đã có response rồi, không gọi nữa

    let cancelled = false;

    (async () => {
      try {
        await connect(); // connect() tự check state, không spam
        if (cancelled) return;
        await loadHistory(conversationId, supportRequestId);
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    peerId,
    conversationId,
    supportRequestId,
    connect,
    loadHistory,
    loadedOnce,
  ]);

  // typing edge-based
  const prevNonEmpty = useRef(false);
  useEffect(() => {
    if (!peerId) return;

    if (chatLocked) {
      // nếu đã locked (resolved hoặc read-only) thì đảm bảo không gửi typing nữa
      if (prevNonEmpty.current) {
        void stopTyping(peerId);
        prevNonEmpty.current = false;
      }
      return;
    }

    const nonEmpty = !!input.trim();
    if (!prevNonEmpty.current && nonEmpty) void startTyping(peerId);
    else if (prevNonEmpty.current && !nonEmpty) void stopTyping(peerId);
    prevNonEmpty.current = nonEmpty;

    return () => {
      if (prevNonEmpty.current && peerId) void stopTyping(peerId);
      prevNonEmpty.current = false;
    };
  }, [input, peerId, startTyping, stopTyping, chatLocked]);

  // send
  const onSend = async () => {
    if (chatLocked) return; // khóa chat sau khi resolved hoặc read-only
    if (!peerId || !courseId || !currentUserId) return;
    const message = input.trim();
    if (!message) return;

    const tempId = uuid();
    const local: ChatMessage = {
      id: tempId,
      senderId: currentUserId,
      senderName: "Me",
      receiverId: peerId,
      receiverName: peerName,
      message,
      sentAt: new Date().toISOString(),
      isDeleted: false,
    };
    pendingRef.current.set(tempId, {
      createdAt: Date.now(),
      message,
      receiverId: peerId,
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
        receiverId: peerId,
        message,
        conversationId,
        supportRequestId, // gửi kèm supportRequestId từ URL
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

  const typingText =
    peerId && typingMap[peerId] && !chatLocked
      ? `${peerName} is typing…`
      : "";

  // tìm message staff mới nhất hỏi "Has your need been resolved?"
  const resolveQuestionId = useMemo(() => {
    if (!currentUserId) return null;
    const haystack = messages.filter(
      (m) =>
        m.senderId !== currentUserId &&
        m.message.trim() === "Has your need been resolved?",
    );
    if (!haystack.length) return null;
    return haystack[haystack.length - 1].id;
  }, [messages, currentUserId]);

  const showResolveDialog =
    !!resolveQuestionId && !resolveHandled && !chatLocked && !isReadOnly;

  const handleConfirmResolved = async () => {
    if (!supportRequestId) {
      // không có id thì chỉ đóng popup, không khóa chat
      setResolveHandled(true);
      return;
    }

    try {
      await resolveSupportRequest(supportRequestId);
      setResolveHandled(true);
      setIsResolved(true); // sau khi xác nhận xong thì khóa chat
    } catch {
      // lỗi interceptor xử lý, không đổi state
    }
  };

  const handleNotResolved = () => {
    setResolveHandled(true); // đóng popup nhưng vẫn chat tiếp
  };

  // ⭐ build timeline: Today / Yesterday / ... + showTime
  const rendered = useMemo<ChatTimelineItem<ChatMessage>[]>(
    () => buildChatTimeline(messages, currentUserId),
    [messages, currentUserId],
  );

  if (!courseId || !conversationId) {
    return (
      <div className="p-4 text-sm text-red-500">
        Missing courseId or conversationId.
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Back + title */}
      <div className="mb-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-white text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-[var(--brand)]" />
            <h1 className="text-base font-semibold text-nav">
              Support conversation
            </h1>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Chat with <span className="font-medium">{peerName}</span>
          </p>
        </div>
      </div>

      <Card className="border-[var(--border)] bg-[var(--card)] h-[520px] flex flex-col shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
          {!peerId ? (
            <div className="text-xs font-medium text-[var(--text-muted)]">
              Missing staff information.
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border border-[var(--border)] shadow-sm">
                <AvatarImage src={undefined} alt={peerName || "Support"} />
                <AvatarFallback className="bg-[var(--background)] text-[var(--brand-700)] text-xs font-semibold">
                  {initial(peerName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-nav truncate">
                  {peerName}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] truncate">
                  Support staff
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        {!peerId ? (
          <div className="flex flex-1 items-center justify-center px-6 py-4 text-xs text-[var(--text-muted)]">
            Cannot open support chat. Please go back and try again.
          </div>
        ) : (
          <>
            <div
              ref={listRef}
              className="relative flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-stable"
            >
              {/* Loading skeleton */}
              {loadingHistory && !loadedOnce && (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className={cx(
                        "flex",
                        i % 2 === 0 ? "justify-start" : "justify-end",
                      )}
                    >
                      <div className="max-w-[75%] rounded-2xl px-3 py-2">
                        <Skeleton className="h-4 w-32 mb-1 rounded-full" />
                        <Skeleton className="h-4 w-40 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loadingHistory && messages.length === 0 && (
                <div className="text-xs text-[var(--text-muted)]">
                  No messages yet. Say hi!
                </div>
              )}

              {!loadingHistory &&
                rendered.map((it) =>
                  it.kind === "sep" ? (
                    // separator "Today / Yesterday / ..."
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
                    // message bubble
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
                                className="absolute top.full right-0 z-50 mt-2 w-40 rounded-lg border border-[var(--border)] bg-white py-1 text-xs text-slate-700 shadow-xl"
                              >
                                <button
                                  className="w-full px-3 py-1.5 text-left hover:bg-slate-50"
                                  disabled={deleting}
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    requestDelete(it.m.id); // dùng hook xoá chung
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

                        {it.showTime && (
                          <div className="mt-1 text-[10px] opacity-70 text-right">
                            {timeHHmm(parseServerDate(it.m.sentAt))}
                          </div>
                        )}
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
            {chatLocked ? (
              <div className="border-t border-[var(--border)] px-4 py-3 text-xs text-[var(--text-muted)]">
                {isReadOnly ? (
                  <>
                    {readOnlyReason ? (
                      <span>{readOnlyReason}</span>
                    ) : (
                      <>
                        This conversation has been{" "}
                        <span className="font-semibold text-brand">closed</span>
                        . You can no longer send new messages.
                      </>
                    )}
                  </>
                ) : (
                  <>
                    This support request has been marked as{" "}
                    <span className="font-semibold text-brand">resolved</span>.
                    You can no longer send new messages in this conversation.
                  </>
                )}
              </div>
            ) : (
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
            )}
          </>
        )}
      </Card>

      {/* 🔥 Dialog xoá tái sử dụng hook */}
      {ConfirmDialog}

      {/* Overlay xác nhận đã giải quyết – gọi component riêng */}
      <ResolveSupportRequestDialog
        open={showResolveDialog}
        peerName={peerName}
        resolving={resolving}
        onConfirmResolved={handleConfirmResolved}
        onNotResolved={handleNotResolved}
      />
    </div>
  );
}

// app/.../crawler/components/CrawlerAssignmentConversationsSection.tsx
"use client";

import { MessageCircle, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { CrawlerChatConversationItem } from "@/types/crawler-chat/crawler-chat.response";
import { formatDateOnlyVN } from "@/utils/datetime/format-datetime";

type Props = {
  conversations: CrawlerChatConversationItem[];
  loading: boolean;
  selectedConversationId?: string | null;
  onSelectConversation?: (conversationId: string) => void;
  onNewConversation?: () => void;
};

export default function CrawlerAssignmentConversationsSection({
  conversations,
  loading,
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
}: Props) {
  const hasConversations = conversations.length > 0;
  const showLoading = loading && !hasConversations;
  const formatTime = (value: string) =>
    new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-white px-4 py-4">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--brand)]/10 text-[var(--brand)]">
            <MessageCircle className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-900">AI History</p>
            <p className="text-[11px] text-[var(--text-muted)]">Previous chats with the assistant.</p>
          </div>
        </div>

        {onNewConversation && (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onNewConversation}
              className="inline-flex w-full items-center justify-start gap-2 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-[11px] font-semibold text-[var(--foreground)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand)]/10 text-[var(--brand)]">
                <Plus className="h-3.5 w-3.5" />
              </span>
              <span>New chat</span>
            </button>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
              History
            </span>
          </div>
        )}

        <div className="space-y-3">
          {showLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
            </div>
          ) : !hasConversations ? (
            <p className="text-[11px] text-slate-500 text-center py-2">
              You have no previous AI conversations yet.
            </p>
          ) : (
            <div className="space-y-2">
              <ul className="space-y-2 max-h-[420px] overflow-y-auto">
                {conversations
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.lastMessageAt).getTime() -
                      new Date(a.lastMessageAt).getTime()
                  )
                .map((c) => {
                  const isActive = c.conversationId === selectedConversationId;
                  const title =
                    (c.conversationName && c.conversationName.trim()) ||
                    "Conversation";

                    return (
                      <li
                        key={c.conversationId}
                        role="button"
                        tabIndex={0}
                        onClick={() => onSelectConversation?.(c.conversationId)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            onSelectConversation?.(c.conversationId);
                          }
                        }}
                        className={`group flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${
                          isActive
                            ? "border-[var(--brand)] bg-white"
                            : "border-[var(--border)] bg-white hover:border-[var(--brand)]/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 group-hover:bg-[var(--brand)]/10 group-hover:text-[var(--brand)] transition">
                            <MessageCircle className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col">
                            <span
                              className={`text-[13px] font-semibold ${
                                isActive ? "text-[var(--brand)]" : "text-slate-800"
                              }`}
                            >
                              {title}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {formatDateOnlyVN(c.lastMessageAt)} · {formatTime(c.lastMessageAt)}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

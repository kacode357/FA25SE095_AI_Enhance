// app/.../crawler/components/CrawlerAssignmentConversationsSection.tsx
"use client";

import { MessageCircle, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { CrawlerChatConversationItem } from "@/types/crawler-chat/crawler-chat.response";
import { formatDateOnlyVN, formatTimeOnlyVN } from "@/utils/datetime/format-datetime";

type Props = {
  conversations: CrawlerChatConversationItem[];
  loading: boolean;
  refreshingConversationId?: string | null;
  selectedConversationId?: string | null;
  onSelectConversation?: (conversationId: string) => void;
  onNewConversation?: () => void;
};

export default function CrawlerAssignmentConversationsSection({
  conversations,
  loading,
  refreshingConversationId = null,
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
}: Props) {
  const hasConversations = conversations.length > 0;
  const showInitialLoading = loading && !hasConversations;
  const hasRefreshingItem = Boolean(refreshingConversationId);
  const shouldShowEmptyState = !hasConversations && !hasRefreshingItem;
  const isRefreshingInList = hasRefreshingItem
    ? conversations.some((item) => item.conversationId === refreshingConversationId)
    : false;
  const formatTime = (value: string) => formatTimeOnlyVN(value);

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
          {showInitialLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
            </div>
          ) : shouldShowEmptyState ? (
            <p className="text-[11px] text-slate-500 text-center py-2">
              You have no previous AI conversations yet.
            </p>
          ) : (
            <div className="space-y-2">
              <ul className="space-y-2 max-h-[420px] overflow-y-auto">
                {hasRefreshingItem && !isRefreshingInList && (
                  <li className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </li>
                )}
                {conversations
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.lastMessageAt).getTime() -
                      new Date(a.lastMessageAt).getTime()
                  )
                .map((c) => {
                  const isRefreshing =
                    c.conversationId === refreshingConversationId &&
                    !(c.conversationName && c.conversationName.trim());
                  const isActive = !isRefreshing && c.conversationId === selectedConversationId;
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
                        <div className="flex flex-col">
                          {isRefreshing ? (
                            <div className="flex flex-col gap-1">
                              <Skeleton className="h-4 w-40" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          ) : (
                            <>
                              <span
                                className={`text-[13px] font-semibold ${
                                  isActive ? "text-[var(--brand)]" : "text-slate-800"
                                }`}
                              >
                                {title}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {formatDateOnlyVN(c.lastMessageAt)} - {formatTime(c.lastMessageAt)}
                              </span>
                            </>
                          )}
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




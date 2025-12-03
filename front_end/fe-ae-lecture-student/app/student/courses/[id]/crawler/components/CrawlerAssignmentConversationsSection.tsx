// app/.../crawler/components/CrawlerAssignmentConversationsSection.tsx
"use client";

import { ChevronDown, MessageCircle } from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import type { CrawlerChatConversationItem } from "@/types/crawler-chat/crawler-chat.response";

type Props = {
  conversations: CrawlerChatConversationItem[];
  loading: boolean;
  selectedConversationId?: string | null;
  onSelectConversation?: (conversationId: string) => void;
};

export default function CrawlerAssignmentConversationsSection({
  conversations,
  loading,
  selectedConversationId,
  onSelectConversation,
}: Props) {
  const [open, setOpen] = useState<boolean>(true);

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 shadow-sm">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50">
              <MessageCircle className="h-4 w-4 text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                AI History
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Previous chats with the assistant.
              </p>
            </div>
          </div>

          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
            >
              {open ? "Collapse" : "Expand"}
              <ChevronDown
                className={`h-3 w-3 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="mt-3 space-y-3">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-[11px] text-slate-500 text-center py-2">
              You have no previous AI conversations yet.
            </p>
          ) : (
            <div className="space-y-2">
              <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-slate-50/60 max-h-[400px] overflow-y-auto">
                {conversations
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.lastMessageAt).getTime() -
                      new Date(a.lastMessageAt).getTime()
                  )
                  .map((c) => {
                    const isActive =
                      c.conversationId === selectedConversationId;

                    return (
                      <li
                        key={c.conversationId}
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          onSelectConversation?.(c.conversationId)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            onSelectConversation?.(c.conversationId);
                          }
                        }}
                        className={`px-3 py-3 text-xs flex flex-col gap-1 cursor-pointer transition-all border-l-2 ${
                          isActive
                            ? "bg-white border-l-blue-500 shadow-sm"
                            : "border-l-transparent hover:bg-white/80"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`font-medium ${
                              isActive ? "text-blue-700" : "text-slate-800"
                            }`}
                          >
                            Conversation
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(c.lastMessageAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-slate-600">
                            {c.messageCount} messages
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(c.lastMessageAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}
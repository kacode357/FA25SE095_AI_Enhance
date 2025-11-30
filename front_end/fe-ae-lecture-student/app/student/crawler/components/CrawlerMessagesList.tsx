"use client";

import { type RefObject } from "react";
import {
  MessageType,
  type ChatMessageDto,
  type CrawlerResponseDto,
} from "@/hooks/hubcrawlerchat/useCrawlerChatHub";

export type LocalMessage =
  | { kind: "user"; msg: ChatMessageDto }
  | { kind: "crawler"; msg: CrawlerResponseDto };

type Props = {
  messages: LocalMessage[];
  loadingHistory: boolean;
  // 👇 cho phép null để khớp với useRef<HTMLDivElement | null>
  messagesEndRef: RefObject<HTMLDivElement | null>;
};

export default function CrawlerMessagesList({
  messages,
  loadingHistory,
  messagesEndRef,
}: Props) {
  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 text-sm">
      {messages.length === 0 && !loadingHistory && (
        <div className="text-xs text-slate-400">
          Gửi message đầu tiên để tạo hoặc gắn vào conversation và khởi động
          crawl job.
        </div>
      )}

      {loadingHistory && (
        <div className="text-xs text-slate-400">Đang tải lịch sử chat…</div>
      )}

      {messages.map((item, idx) => {
        const key =
          item.kind === "user"
            ? item.msg.messageId ?? `u-${idx}`
            : item.msg.responseId ?? `c-${idx}`;

        if (item.kind === "user") {
          const m = item.msg;
          const isCrawlRequest = m.messageType === MessageType.CrawlRequest;
          return (
            <div key={key} className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl bg-indigo-500 text-white px-3 py-2 text-xs sm:text-sm">
                <div className="text-[10px] opacity-80 mb-0.5">
                  {m.userName || "You"}
                  {isCrawlRequest && " · Crawl request"}
                </div>
                <div className="whitespace-pre-wrap break-words">
                  {m.content}
                </div>
              </div>
            </div>
          );
        }

        const m = item.msg;
        return (
          <div key={key} className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl bg-slate-100 text-slate-900 px-3 py-2 text-xs sm:text-sm">
              <div className="text-[10px] font-semibold text-slate-500 mb-0.5">
                Crawler bot {m.status ? `· ${m.status}` : ""}
              </div>
              <div className="whitespace-pre-wrap break-words">
                {m.content}
              </div>
            </div>
          </div>
        );
      })}

      {/* ref có thể null nên type là HTMLDivElement | null */}
      <div ref={messagesEndRef} />
    </div>
  );
}

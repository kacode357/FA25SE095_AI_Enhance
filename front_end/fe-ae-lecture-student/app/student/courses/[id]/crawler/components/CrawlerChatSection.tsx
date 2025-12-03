// app/.../crawler/components/CrawlerChatSection.tsx
"use client";

import type { UiMessage } from "../crawler-types";

type Props = {
  chatMessages: UiMessage[];
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onSendChat: () => void;
  chatSending: boolean;
  chatConnected: boolean;
};

export default function CrawlerChatSection({
  chatMessages,
  chatInput,
  onChatInputChange,
  onSendChat,
  chatSending,
  chatConnected,
}: Props) {
  const disabledSend = !chatInput.trim() || chatSending || !chatConnected;

  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-900">
            💬 Chat with Agent
          </div>
          <p className="text-[11px] text-slate-500">
            Chat qua SignalR. Nếu tin nhắn chứa từ khoá &quot;summary / insights
            / tóm tắt ...&quot; sẽ được mark{" "}
            <code className="rounded bg-slate-100 px-1">
              FollowUpQuestion (6)
            </code>{" "}
            để BE gọi Agent.
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-[220px] max-h-[360px] overflow-auto rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 space-y-2 text-xs">
        {chatMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-[11px] text-slate-400 text-center">
            <div className="mb-2 text-xl">🤖</div>
            <p>
              Hãy hỏi Agent:
              <br />
              <span className="font-medium text-slate-500">
                &quot;Give me a summary of the crawled products and show key
                insights&quot;
              </span>
            </p>
          </div>
        ) : (
          chatMessages.map((m) => (
            <div
              key={m.id}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-[11px] leading-relaxed shadow-sm ${
                  m.role === "user"
                    ? "bg-indigo-500 text-white rounded-br-sm"
                    : m.role === "system"
                    ? "bg-slate-200 text-slate-800 rounded-b-sm"
                    : "bg-white text-slate-800 rounded-bl-sm border border-slate-100"
                }`}
              >
                <div className="whitespace-pre-line">{m.content}</div>
                <div
                  className={`mt-1 text-[9px] ${
                    m.role === "user"
                      ? "text-indigo-100/80"
                      : "text-slate-400"
                  }`}
                >
                  {new Date(m.createdAt).toLocaleTimeString()} •{" "}
                  {m.messageType !== undefined && `Type ${m.messageType}`}
                </div>
              </div>
            </div>
          ))
        )}
        {chatSending && (
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[11px] text-slate-500 border border-slate-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Sending...
            </div>
          </div>
        )}
      </div>

      <div className="mt-1 flex items-end gap-2">
        <textarea
          rows={2}
          value={chatInput}
          onChange={(e) => onChatInputChange(e.target.value)}
          placeholder='Ví dụ: "Give me summary and top 5 cheapest games from Nintendo brand"'
          className="flex-1 resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none ring-0 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
        <button
          type="button"
          onClick={onSendChat}
          disabled={disabledSend}
          className="flex h-[40px] items-center justify-center rounded-lg bg-indigo-500 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Gửi
        </button>
      </div>

      <p className="text-[10px] text-slate-400">
        • Tin nhắn user có keyword sẽ được gửi với{" "}
        <code className="rounded bg-slate-100 px-1">messageType 6</code>{" "}
        (FollowUpQuestion). • Khi BE trả về{" "}
        <code className="rounded bg-slate-100 px-1">messageType 5</code>{" "}
        (AiSummary) kèm <code>crawlJobId</code>, FE tự động gọi{" "}
        <code className="rounded bg-slate-100 px-1">
          GET /api/analytics/jobs/&lt;jobId&gt;/summary
        </code>{" "}
        và render vào khung &quot;Crawl Summary&quot; bên trái.
      </p>
    </div>
  );
}

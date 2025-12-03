// app/student/courses/[id]/crawler/components/CrawlerChatSection.tsx
"use client";

import { MessageSquare, Bot, Send, Info } from "lucide-react";
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
    <div className="rounded-xl border border-[var(--border)] bg-white/95 p-4 shadow-sm flex flex-col gap-3 h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
            <Bot className="h-4 w-4 text-[var(--brand)]" />
            Chat with Agent
          </div>
          <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
            <Info className="h-3 w-3" />
            <span>
              Keywords like "summary", "insights" trigger{" "}
              <code className="bg-slate-100 px-1 py-0.5 rounded text-[10px] text-slate-700 font-mono">
                FollowUpQuestion
              </code>{" "}
              mode.
            </span>
          </p>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 min-h-[300px] max-h-[500px] overflow-y-auto rounded-xl border border-[var(--border)] bg-slate-50/50 px-3 py-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {chatMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-xs text-[var(--text-muted)] opacity-80">
            <div className="mb-3 h-12 w-12 rounded-full bg-[var(--brand)]/10 flex items-center justify-center text-[var(--brand)]">
              <Bot className="h-6 w-6" />
            </div>
            <p className="max-w-[240px]">
              Start by asking the agent:
              <br />
              <span className="font-medium text-slate-700 block mt-2">
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
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm relative group ${
                  m.role === "user"
                    ? "bg-[var(--brand)] text-white rounded-br-sm"
                    : m.role === "system"
                    ? "bg-slate-100 text-slate-700 rounded-lg text-[11px] border border-slate-200"
                    : "bg-white text-slate-800 rounded-bl-sm border border-[var(--border)]"
                }`}
              >
                <div className="whitespace-pre-line">{m.content}</div>
                
                {/* Meta info (Time & Type) */}
                <div
                  className={`mt-1 text-[10px] flex items-center justify-end gap-2 opacity-70 ${
                    m.role === "user" ? "text-indigo-100" : "text-slate-400"
                  }`}
                >
                  <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {m.messageType !== undefined && (
                    <span className="uppercase tracking-tighter text-[9px] border border-current px-1 rounded-[3px]">
                      Type {m.messageType}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Loading Indicator */}
        {chatSending && (
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] text-[var(--text-muted)] border border-[var(--border)] shadow-sm">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)] animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)] animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)] animate-bounce"></span>
              </span>
              <span>Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="mt-2 flex items-end gap-2">
        <textarea
          rows={1}
          value={chatInput}
          onChange={(e) => onChatInputChange(e.target.value)}
          placeholder='Ask about the data, e.g., "Top 5 cheapest items"'
          className="flex-1 resize-none rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--focus-ring)] min-h-[44px] max-h-[120px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (!disabledSend) onSendChat();
            }
          }}
        />
        <button
          type="button"
          onClick={onSendChat}
          disabled={disabledSend}
          className="btn-gradient-slow h-[44px] w-[44px] flex items-center justify-center rounded-xl shadow-md disabled:opacity-50 disabled:shadow-none transition-transform active:scale-95"
          title="Send Message"
        >
          <Send className="h-5 w-5 ml-0.5" />
        </button>
      </div>

      {/* Footer Technical Note */}
      <div className="px-1 text-[10px] text-[var(--text-muted)] leading-tight opacity-70">
        • Agent auto-detects intent via keywords. <br/>
        • Complex queries may trigger backend analysis (Type 6).
      </div>
    </div>
  );
}
// app/student/courses/[id]/crawler/components/CrawlerChatSection.tsx
"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Bot, Database, Send, Upload, Loader2 } from "lucide-react";

import type { UiMessage } from "../crawler-types";
import CrawlerChatMessageList from "./CrawlerChatMessageList";
import CrawlerCsvUploadDialog from "./CrawlerCsvUploadDialog";

type Props = {
  chatMessages: UiMessage[];
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onSendChat: (contentOverride?: string) => void;
  onUploadCsv?: (file: File) => Promise<void> | void;
  uploadingCsv?: boolean;
  chatSending: boolean;
  chatConnected: boolean;
  includeHistory: boolean;
  onIncludeHistoryChange: (value: boolean) => void;
  chatReady?: boolean;
  thinking?: boolean;
  onOpenResults?: () => void;
  resultsAvailable?: boolean;
};

// -------------------------
// Main component
// -------------------------
function CrawlerChatSection({
  chatMessages,
  chatInput,
  onChatInputChange,
  onSendChat,
  onUploadCsv,
  uploadingCsv = false,
  chatSending,
  chatConnected,
  includeHistory,
  onIncludeHistoryChange,
  chatReady = true,
  thinking = false,
  onOpenResults,
  resultsAvailable = false,
}: Props) {
  const canChat = chatConnected && chatReady;
  const disabledSend = !chatInput.trim() || chatSending || !canChat;
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const showSuggestions = canChat && chatMessages.length === 1;
  const suggestionPrompts = useMemo(
    () => [
      "Summarize the key findings from the crawl.",
      "List the top 5 items with name, price, and brand.",
      "Show the price range and the average price.",
      "Group the results by category and count each group.",
      "Highlight any missing or inconsistent fields.",
    ],
    []
  );

  const handleUploadButtonClick = useCallback(() => {
    if (!onUploadCsv || uploadingCsv || !canChat) return;
    setUploadDialogOpen(true);
  }, [canChat, onUploadCsv, uploadingCsv]);

  const uploadDisabled = !onUploadCsv || uploadingCsv || !canChat;

  return (
    <div
      className="flex h-[600px] flex-col gap-2.5 rounded-lg border border-[var(--border)] bg-white/95 p-3 shadow-sm"
      data-tour="crawler-chat"
    >
      <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-[var(--border)] pb-1.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--foreground)]">
            <Bot className="h-3.5 w-3.5 text-[var(--brand)]" />
            Chat with Agent
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <label
            htmlFor="crawler-include-history"
            className="flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-white px-2 py-0.5 text-[9px] font-semibold text-[var(--foreground)]"
          >
            <input
              id="crawler-include-history"
              type="checkbox"
              checked={includeHistory}
              onChange={(e) => onIncludeHistoryChange(e.target.checked)}
              className="h-3 w-3 rounded border-slate-300 text-[var(--brand)] focus:ring-[var(--focus-ring)]"
            />
            <span>Use chat history</span>
          </label>
          {onOpenResults && (
            <button
              type="button"
              onClick={onOpenResults}
              disabled={!resultsAvailable}
              className="btn btn-blue-slow h-6 px-2.5 py-0.5 text-[9px] font-semibold shadow-sm disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
            >
              <Database className="h-3 w-3 text-white" />
              View Crawled Data
            </button>
          )}
        </div>
      </div>

      <CrawlerChatMessageList
        chatMessages={chatMessages}
        chatSending={chatSending}
        thinking={thinking}
        chatReady={chatReady}
      />

      {showSuggestions && (
        <div className="rounded-lg border border-[var(--border)] bg-white/80 px-3 py-2 text-[11px]">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Suggested prompts
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestionPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => onChatInputChange(prompt)}
                className="rounded-full border border-[var(--border)] bg-white px-3 py-1 text-[10px] font-medium text-[var(--foreground)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-1.5 flex items-end gap-1.5">
        <button
          type="button"
          onClick={handleUploadButtonClick}
          disabled={uploadDisabled}
          className="flex h-[36px] items-center gap-1 rounded-lg border border-dashed border-[var(--border)] bg-slate-50/70 px-2.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--brand)] transition hover:bg-[var(--brand)]/10 disabled:cursor-not-allowed disabled:opacity-60"
          title="Upload CSV file"
        >
          {uploadingCsv ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          <span>Upload CSV</span>
        </button>

        <textarea
          rows={1}
          value={chatInput}
          onChange={(e) => onChatInputChange(e.target.value)}
          placeholder={canChat ? "Ask about the data..." : "Start a crawl or select a conversation to chat..."}
          disabled={!canChat}
          className="min-h-[36px] max-h-[96px] flex-1 resize-none rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-[12px] outline-none transition-all placeholder:text-slate-400 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:bg-slate-100/80 disabled:text-slate-400"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!disabledSend) onSendChat();
            }
          }}
        />

        <button
          type="button"
          onClick={() => onSendChat()}
          disabled={disabledSend}
          className="btn-gradient-slow flex h-[36px] w-[36px] items-center justify-center rounded-lg shadow-md transition-transform disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none active:scale-95"
          title="Send Message"
        >
          <Send className="ml-0.5 h-4 w-4" />
        </button>
      </div>

      {onUploadCsv && (
        <CrawlerCsvUploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          onConfirm={onUploadCsv}
          uploading={uploadingCsv}
        />
      )}
    </div>
  );
}

export default React.memo(CrawlerChatSection);

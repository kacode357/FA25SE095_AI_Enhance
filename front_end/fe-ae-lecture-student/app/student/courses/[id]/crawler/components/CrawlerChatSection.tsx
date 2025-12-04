"use client";

import React, { useMemo } from "react";
import { Bot, Send, Info } from "lucide-react";
import type { UiMessage } from "../crawler-types";

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from "chart.js";
import { Chart } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
);

type Props = {
  chatMessages: UiMessage[];
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onSendChat: () => void;
  chatSending: boolean;
  chatConnected: boolean;
};

// --- PHẦN QUAN TRỌNG NHẤT: XỬ LÝ DỮ LIỆU BIỂU ĐỒ ---
const ChatVisualization = ({ rawJson }: { rawJson: unknown }) => {
  const parsedData = useMemo(() => {
    if (!rawJson) return null;

    try {
      // 1. Chuẩn hóa: nếu là string thì JSON.parse, nếu là object thì dùng luôn
      const outer =
        typeof rawJson === "string" ? JSON.parse(rawJson) : (rawJson as any);

      // 2. 2 case chính:
      //    - Case 1 (như response mày gửi):
      //      { latestResultCrawlJobId, insightHighlights, visualizationData: { type, data, options } }
      //    - Case 2: trực tiếp: { type, data, options }
      const chartConfig =
        outer.visualizationData ?? outer.VisualizationData ?? outer;

      if (!chartConfig || !chartConfig.data) return null;

      return {
        highlights: outer.insightHighlights || outer.InsightHighlights || [],
        chartConfig,
      };
    } catch (e) {
      console.error("Failed to parse visualizationData:", e, rawJson);
      return null;
    }
  }, [rawJson]);

  if (!parsedData) return null;

  const { highlights, chartConfig } = parsedData;

  return (
    <div className="mt-3 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      {/* 1. Insights Text */}
      {highlights && highlights.length > 0 && (
        <div className="text-xs text-slate-700">
          <strong className="mb-1 block text-[var(--brand)]">
            Key Insights:
          </strong>
          <ul className="space-y-1 list-disc pl-4">
            {highlights.map((hl: string, idx: number) => (
              <li key={idx}>{hl}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 2. Chart Rendering */}
      {chartConfig && (
        <div className="mt-1 h-[250px] w-full">
          <Chart
            // type: "bar" | "line" | ...
     
            type={chartConfig.type || "bar"}
            data={chartConfig.data}
            options={{
              ...(chartConfig.options || {}),
              maintainAspectRatio: false,
              responsive: true,
            }}
          />
        </div>
      )}
    </div>
  );
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
    <div className="flex h-full flex-col gap-3 rounded-xl border border-[var(--border)] bg-white/95 p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
            <Bot className="h-4 w-4 text-[var(--brand)]" />
            Chat with Agent
          </div>
          <p className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
            <Info className="h-3 w-3" />
            <span>
              Keywords like "summary", "insights" trigger{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px] font-mono text-slate-700">
                analysis
              </code>{" "}
              mode.
            </span>
          </p>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent flex-1 space-y-3 rounded-xl border border-[var(--border)] bg-slate-50/50 px-3 py-3 min-h-[300px] max-h-[500px] overflow-y-auto">
        {chatMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-xs text-[var(--text-muted)] opacity-80">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand)]/10 text-[var(--brand)]">
              <Bot className="h-6 w-6" />
            </div>
            <p className="max-w-[240px]">
              Start by asking the agent:
              <br />
              <span className="mt-2 block font-medium text-slate-700">
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
                className={`relative group max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                  m.role === "user"
                    ? "rounded-br-sm bg-[var(--brand)] text-white"
                    : m.role === "system"
                    ? "rounded-lg border border-slate-200 bg-slate-100 text-[11px] text-slate-700"
                    : "rounded-bl-sm border border-[var(--border)] bg-white text-slate-800"
                }`}
              >
                {/* Nội dung Text */}
                <div className="whitespace-pre-line">{m.content}</div>

                {/* Render Chart/Visualization nếu có dữ liệu */}
                {m.visualizationData && (
                  <ChatVisualization rawJson={m.visualizationData} />
                )}

                {/* Meta info */}
                <div
                  className={`mt-1 flex items-center justify-end gap-2 text-[10px] opacity-70 ${
                    m.role === "user" ? "text-indigo-100" : "text-slate-400"
                  }`}
                >
                  <span>
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}

        {chatSending && (
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-[11px] text-[var(--text-muted)] shadow-sm">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--brand)] [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--brand)] [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--brand)]" />
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
          placeholder="Ask about the data..."
          className="min-h-[44px] max-h-[120px] flex-1 resize-none rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--focus-ring)]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!disabledSend) onSendChat();
            }
          }}
        />
        <button
          type="button"
          onClick={onSendChat}
          disabled={disabledSend}
          className="btn-gradient-slow flex h-[44px] w-[44px] items-center justify-center rounded-xl shadow-md transition-transform disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none active:scale-95"
          title="Send Message"
        >
          <Send className="ml-0.5 h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

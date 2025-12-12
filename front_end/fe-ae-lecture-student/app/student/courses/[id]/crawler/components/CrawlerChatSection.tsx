// app/student/courses/[id]/crawler/components/CrawlerChatSection.tsx
"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { Bot, Send } from "lucide-react";
import type { UiMessage } from "../crawler-types";
import { formatDateTimeVN } from "@/utils/datetime/format-datetime";
import ChatPromptHints from "./ChatPromptHints";
import { renderMessageContent } from "../utils/chatFormatting";

// Recharts imports
import {
  ResponsiveContainer,
  BarChart,
  LineChart,
  PieChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  Bar,
  Line,
  Pie,
  Cell,
} from "recharts";

type Props = {
  chatMessages: UiMessage[];
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onSendChat: (contentOverride?: string) => void;
  chatSending: boolean;
  chatConnected: boolean;
  thinking?: boolean;
};

// Kiểu dữ liệu adapter cho Recharts
type RechartsAdaptedData = {
  data: Array<Record<string, any>>;
  seriesKeys: string[];
};

// Adapter từ chartConfig kiểu Chart.js -> data cho Recharts
function buildRechartsData(chartConfig: any): RechartsAdaptedData | null {
  // Hỗ trợ format Chart.js (labels/datasets) và Apex-like (data: { labels, series })
  let rawData =
    chartConfig?.data?.data ?? // Apex nested
    chartConfig?.data ?? // Chart.js or flattened
    chartConfig?.dataset;

  // Nếu data là string JSON thì parse
  if (typeof rawData === "string") {
    try {
      rawData = JSON.parse(rawData);
    } catch {
      rawData = null;
    }
  }

  if (!rawData) return null;

  // Chuẩn hóa sang datasets/labels
  let labels: string[] | undefined;
  let datasets: any[] | undefined;

  if (Array.isArray(rawData.labels)) {
    labels = rawData.labels;
    if (Array.isArray(rawData.datasets)) {
      datasets = rawData.datasets;
    } else if (Array.isArray(rawData.series)) {
      // Apex style series: number[] (single series)
      datasets = [
        {
          label:
            chartConfig?.data?.chart?.title ||
            chartConfig?.chart?.title ||
            "Series",
          data: rawData.series,
        },
      ];
    }
  } else if (Array.isArray(rawData.series) && Array.isArray(rawData.labelsSeries)) {
    // Custom shape: labelsSeries + series
    labels = rawData.labelsSeries;
    datasets = [
      {
        label:
          chartConfig?.data?.chart?.title ||
          chartConfig?.chart?.title ||
          "Series",
        data: rawData.series,
      },
    ];
  }

  if (!labels || !datasets || !datasets.length) return null;

  const seriesKeys: string[] = datasets.map(
    (ds: any, idx: number) => ds.label || `value${idx + 1}`
  );

  const rows = labels.map((label: string, i: number) => {
    const row: Record<string, any> = { label };
    datasets!.forEach((ds: any, idx: number) => {
      const key = seriesKeys[idx];
      const value = Array.isArray(ds.data) ? ds.data[i] ?? null : null;
      row[key] = value;
    });
    return row;
  });

  return { data: rows, seriesKeys };
}

const ChatVisualization = ({ rawJson }: { rawJson: unknown }) => {
  const parsedData = useMemo(() => {
    if (!rawJson) return null;

    try {
      // 1. Chuẩn bị: nếu là string thì JSON.parse, nếu là object thì dùng luôn
      const outer =
        typeof rawJson === "string" ? JSON.parse(rawJson) : (rawJson as any);

      // 2. 2 case chính:
      //    - Case 1: { latestResultCrawlJobId, insightHighlights, visualizationData: { type, data, options } }
      //    - Case 2: trực tiếp: { type, data, options }
      let chartConfig =
        outer.visualizationData ?? outer.VisualizationData ?? outer;

      // Nếu chartConfig.data là string hoặc nested string -> parse
      if (chartConfig?.data && typeof chartConfig.data === "string") {
        try {
          chartConfig = { ...chartConfig, data: JSON.parse(chartConfig.data) };
        } catch {
          // ignore parse error
        }
      }
      if (chartConfig?.data?.data && typeof chartConfig.data.data === "string") {
        try {
          chartConfig = {
            ...chartConfig,
            data: { ...chartConfig.data, data: JSON.parse(chartConfig.data.data) },
          };
        } catch {
          // ignore parse error
        }
      }

      if (!chartConfig || !chartConfig.data) return null;

      const adapted = buildRechartsData(chartConfig);
      if (!adapted) return null;

      return {
        highlights: (outer.insightHighlights ||
          outer.InsightHighlights ||
          []) as string[],
        chartType: (chartConfig.type || "bar") as string,
        chartConfig,
        rechartsData: adapted.data,
        seriesKeys: adapted.seriesKeys,
      };
    } catch (e) {
      console.error("Failed to parse visualizationData:", e, rawJson);
      return null;
    }
  }, [rawJson]);

  if (!parsedData) return null;

  const { highlights, chartType, rechartsData, seriesKeys } = parsedData;

  const renderCartesianChart = () => {
    if (chartType === "line") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rechartsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <RechartsTooltip />
            <RechartsLegend />
            {seriesKeys.map((key: string) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                dot={false}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    // default: bar chart
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rechartsData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <RechartsTooltip />
          <RechartsLegend />
          {seriesKeys.map((key: string) => (
            <Bar key={key} dataKey={key} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderPieChart = () => {
    // dạng dataset đầu tiên cho Pie
    const firstSeries = seriesKeys[0];
    if (!firstSeries) return null;

    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <RechartsTooltip />
          <RechartsLegend />
          <Pie
            data={rechartsData}
            dataKey={firstSeries}
            nameKey="label"
            cx="50%"
            cy="50%"
            outerRadius="80%"
            label
          >
            {rechartsData.map((_: Record<string, any>, index: number) => (
              <Cell key={`cell-${index}`} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    );
  };

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

      {/* 2. Chart Rendering (Bar / Line / Pie) */}
      <div className="mt-1 h-[250px] w-full">
        {chartType === "pie" ? renderPieChart() : renderCartesianChart()}
      </div>
    </div>
  );
};

const ChatMessageList = React.memo(function ChatMessageList({
  chatMessages,
  chatSending,
  thinking,
  onSendChat,
  chatConnected,
}: Pick<
  Props,
  "chatMessages" | "chatSending" | "thinking" | "onSendChat" | "chatConnected"
>) {
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [chatMessages.length, thinking, chatSending]);

  return (
    <div
      ref={listRef}
      className="scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent flex-1 space-y-3 rounded-xl border border-[var(--border)] bg-slate-50/50 px-3 py-3 min-h-[300px] max-h-[500px] overflow-y-auto"
    >
      {chatMessages.length === 0 ? (
        // Removed empty-state suggested prompt + quick buttons
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-xs text-[var(--text-muted)] opacity-80">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand)]/10 text-[var(--brand)]">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">
              Start by asking the agent.
            </p>
          </div>
        </div>
      ) : (
        chatMessages.map((m) => {
          const rendered = renderMessageContent(m.content || "");
          return (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
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
                <div
                className="text-[13px] leading-relaxed space-y-1 [&_ul]:ml-4 [&_ul]:list-disc [&_ol]:ml-4 [&_ol]:list-decimal [&_li]:mb-1 [&_a]:text-[var(--brand)] [&_a]:underline [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[11px] [&_strong]:font-semibold [&_p]:last:mb-0 [&_img[data-inline-img]]:my-2 [&_img[data-inline-img]]:max-h-64 [&_img[data-inline-img]]:rounded-lg [&_img[data-inline-img]]:border [&_img[data-inline-img]]:border-[var(--border)] [&_img[data-inline-img]]:bg-white"
                  dangerouslySetInnerHTML={{ __html: rendered.html }}
                />

                {m.extractedData && (
                  <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-700">
                    <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Extracted data
                    </div>
                    <div className="whitespace-pre-line">{m.extractedData}</div>
                  </div>
                )}

                {m.visualizationData && <ChatVisualization rawJson={m.visualizationData} />}

                <div
                  className={`mt-1 flex items-center justify-end gap-2 text-[10px] opacity-70 ${
                    m.role === "user" ? "text-indigo-100" : "text-slate-400"
                  }`}
                >
                  <span>{formatDateTimeVN(m.createdAt)}</span>
                </div>
              </div>
            </div>
          );
        })
      )}

      {(chatSending || thinking) && (
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
  );
});

function CrawlerChatSection({
  chatMessages,
  chatInput,
  onChatInputChange,
  onSendChat,
  chatSending,
  chatConnected,
  thinking = false,
}: Props) {
  const disabledSend = !chatInput.trim() || chatSending || !chatConnected;

  return (
    <div
      className="flex h-full flex-col gap-3 rounded-xl border border-[var(--border)] bg-white/95 p-4 shadow-sm"
      data-tour="crawler-chat"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
            <Bot className="h-4 w-4 text-[var(--brand)]" />
            Chat with Agent
          </div>
        </div>
      </div>

      <ChatPromptHints onSend={onSendChat} disabled={chatSending || !chatConnected} />

      <ChatMessageList
        chatMessages={chatMessages}
        chatSending={chatSending}
        thinking={thinking}
        onSendChat={onSendChat}
        chatConnected={chatConnected}
      />

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
           onClick={() => onSendChat()} 
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

export default React.memo(CrawlerChatSection);

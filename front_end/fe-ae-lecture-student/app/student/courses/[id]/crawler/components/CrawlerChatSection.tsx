// app/student/courses/[id]/crawler/components/CrawlerChatSection.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Send } from "lucide-react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import type { UiMessage } from "../crawler-types";
import { formatDateTimeVN } from "@/utils/datetime/format-datetime";
import ChatPromptHints from "./ChatPromptHints";
import { renderMessageContent } from "../utils/chatFormatting";

// Avoid SSR issues for charts
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

type Props = {
  chatMessages: UiMessage[];
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onSendChat: (contentOverride?: string) => void;
  chatSending: boolean;
  chatConnected: boolean;
  thinking?: boolean;
};

// Sử dụng NonNullable để lấy type chính xác cho ApexCharts
type ApexAdapted = {
  options: ApexOptions;
  series: ApexOptions["series"];
  chartType: NonNullable<ApexOptions["chart"]>["type"];
  highlights: string[];
  height: number;
};

const fallbackColors = ["#4F46E5", "#22C55E", "#06B6D4", "#F59E0B", "#EF4444", "#8b5cf6", "#ec4899", "#6366f1"];

// --- Helper Functions to safely parse JSON ---
function safeParse(input: unknown): any {
  if (typeof input === "string") {
    try {
      return JSON.parse(input);
    } catch {
      return input;
    }
  }
  return input;
}

// Convert backend payload (Chart.js/Apex-like) into ApexCharts config
function buildApexConfig(rawJson: unknown): ApexAdapted | null {
  if (!rawJson) return null;

  try {
    const outer = safeParse(rawJson);
    const chartConfig = outer.visualizationData ?? outer.VisualizationData ?? outer;

    if (chartConfig?.data) {
      chartConfig.data = safeParse(chartConfig.data);
      if (chartConfig.data?.data) {
        chartConfig.data.data = safeParse(chartConfig.data.data);
      }
    }

    if (!chartConfig || !chartConfig.data) return null;

    const rawType =
      chartConfig.type ||
      chartConfig?.data?.chart?.type ||
      chartConfig?.chart?.type ||
      "bar";

    const chartType = ([
      "line", "area", "bar", "pie", "donut", "radialBar",
      "scatter", "bubble", "heatmap", "candlestick",
      "boxPlot", "radar", "polarArea", "rangeBar", "treemap"
    ].includes(rawType)
      ? rawType
      : "bar") as NonNullable<ApexOptions["chart"]>["type"];

    const dataNode =
      chartConfig?.data?.data ?? chartConfig?.data ?? chartConfig?.dataset ?? {};

    const rawSeries =
      dataNode.series ?? chartConfig?.series ?? chartConfig?.data?.series ?? [];
    const rawLabels =
      dataNode.labels ?? dataNode.categories ?? chartConfig?.labels ?? [];

    const colors =
      chartConfig?.data?.colors || chartConfig?.colors || fallbackColors;
    const legendPosition =
      chartConfig?.options?.plugins?.legend?.position || "bottom";
    const titleText =
      chartConfig?.data?.chart?.title ||
      chartConfig?.chart?.title ||
      chartConfig?.title;

    const highlights = (outer.insightHighlights ||
      outer.InsightHighlights ||
      []) as string[];

    // --- CASE 1: PIE / DONUT ---
    if (chartType === "pie" || chartType === "donut") {
      const series =
        Array.isArray(rawSeries) && rawSeries.length && typeof rawSeries[0] === "number"
          ? rawSeries
          : Array.isArray(dataNode.values)
          ? dataNode.values
          : [];

      const finalSeries = (Array.isArray(series) ? series : []) as number[];
      const labels = Array.isArray(rawLabels) ? rawLabels : [];

      const baseHeight = 320;
      const legendHeight = labels.length > 5 ? (labels.length - 5) * 25 : 0;
      const chartHeight = Math.min(1000, baseHeight + legendHeight);

      const options: ApexOptions = {
        chart: {
          toolbar: { show: false },
          height: chartHeight,
        },
        labels,
        colors,
        legend: {
            position: "bottom",
            formatter: function(seriesName: string, opts: any) {
                return seriesName.length > 40 ? seriesName.slice(0, 40) + "..." : seriesName;
            }
        },
        dataLabels: {
          enabled: true,
          dropShadow: { enabled: false },
          style: { fontSize: "11px", fontWeight: 600, colors: ["#fff"] },
          formatter: function (val: number, opts: any) {
             return Math.round(val) + "%";
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => String(val),
          },
        },
        stroke: { colors: ["#fff"], width: 1 },
        title: titleText
          ? { text: titleText, style: { fontSize: "14px" } }
          : undefined,
      };

      return {
        options,
        series: finalSeries,
        chartType,
        height: chartHeight,
        highlights,
      };
    }

    // --- CASE 2: BAR / LINE / AREA ---
    const categories = Array.isArray(dataNode.categories)
      ? dataNode.categories
      : Array.isArray(rawLabels)
      ? rawLabels
      : [];

    const categoriesCount = categories.length;
    const hasLongLabels = categories.some((c: any) => String(c).length > 24);
    const horizontal =
      chartType === "bar" && (categoriesCount > 8 || hasLongLabels);
    const showDataLabels = categoriesCount <= 12;

    const chartHeight = Math.max(
      320,
      Math.min(900, categoriesCount * (horizontal ? 32 : 26) + 160)
    );

    let series: any[] = [];
    if (Array.isArray(rawSeries) && rawSeries.length) {
      const isNumberSeries = rawSeries.every((s: any) => typeof s === "number");
      const isObjectSeries = rawSeries.every((s: any) =>
        Array.isArray((s as any)?.data)
      );

      if (isNumberSeries) {
        series = [
          {
            name: titleText || "Data",
            data: rawSeries as number[],
          },
        ];
      } else if (isObjectSeries) {
        series = rawSeries.map((s: any, idx: number) => ({
          name: s.name || `Series ${idx + 1}`,
          data: s.data || [],
        }));
      }
    }

    if (!series || series.length === 0) return null;

    const isBar = chartType === "bar";

    const options: ApexOptions = {
      chart: {
        toolbar: { show: false },
        animations: {
          enabled: true,
          ...({ easing: "easeinout" } as any),
        },
        height: chartHeight,
      },
      colors,
      plotOptions: isBar
        ? {
            bar: {
              borderRadius: 4,
              columnWidth: "55%",
              distributed: series.length === 1,
              dataLabels: { position: horizontal ? "center" : "top" },
              horizontal,
            },
          }
        : undefined,
      dataLabels: {
        enabled: showDataLabels,
        formatter: (val: number | string) => String(val),
        style: { fontSize: "11px", fontWeight: 600 },
        background: { enabled: false },
      },
      stroke: {
        width: isBar ? 0 : 3,
        curve: "smooth",
      },
      grid: {
        borderColor: "#E2E8F0",
        strokeDashArray: 4,
      },
      xaxis: {
        categories,
        labels: {
          style: { colors: "#64748b" },
          rotate: horizontal ? 0 : -25,
          formatter: (val: string | number) => {
            const strVal = String(val);
            return strVal.length > 28 ? `${strVal.slice(0, 28)}…` : strVal;
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: "#94a3b8" },
          formatter: (val: number) => {
            if (horizontal && String(val).length > 40) {
              return `${String(val).slice(0, 40)}…`;
            }
            return String(val);
          },
        },
      },
      legend: {
        position: legendPosition as any,
        markers: { radius: 12 } as any,
        show: series.length > 1 || (series.length === 1 && isBar),
      },
      title: titleText
        ? { text: titleText, style: { fontSize: "14px", fontWeight: 700 } }
        : undefined,
      tooltip: {
        theme: "light",
        y: {
          formatter: (val: number) => String(val),
        },
      },
    };

    return {
      options,
      series,
      chartType,
      height: chartHeight,
      highlights,
    };
  } catch (err) {
    console.error("Failed to parse visualizationData:", err, rawJson);
    return null;
  }
}

const ChatVisualization = ({ rawJson }: { rawJson: unknown }) => {
  const adapted = useMemo(() => buildApexConfig(rawJson), [rawJson]);

  if (!adapted) return null;

  const { highlights, options, series, chartType, height } = adapted;

  return (
    <div className="mt-3 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
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

      <div className="mt-1 w-full" style={{ height: height }}>
        <ReactApexChart
          type={chartType}
          options={options}
          series={series}
          height={height}
          width="100%"
        />
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
  showPrompts,
}: Pick<
  Props,
  "chatMessages" | "chatSending" | "thinking" | "onSendChat" | "chatConnected"
> & { showPrompts: boolean }) {
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [chatMessages.length, thinking, chatSending, showPrompts]);

  return (
    <div
      ref={listRef}
      // FIX CRITICAL: Đã xóa "min-h-[300px] max-h-[500px]".
      // Thêm "min-h-0" để flex-1 hoạt động đúng, tự động lấp đầy khoảng trống còn lại.
      className="scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent flex-1 min-h-0 space-y-3 rounded-xl border border-[var(--border)] bg-slate-50/50 px-3 py-3 overflow-y-auto"
    >
      {chatMessages.length === 0 ? (
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
  const [showPrompts, setShowPrompts] = useState(true);

  return (
    <div
      className="flex h-[850px] flex-col gap-3 rounded-xl border border-[var(--border)] bg-white/95 p-4 shadow-sm"
      data-tour="crawler-chat"
    >
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
            <Bot className="h-4 w-4 text-[var(--brand)]" />
            Chat with Agent
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowPrompts((prev) => !prev)}
          className="rounded-lg border border-[var(--border)] px-3 py-1 text-[11px] font-medium text-[var(--text-muted)] hover:bg-slate-50 transition"
        >
          {showPrompts ? "Hide prompts" : "Show prompts"}
        </button>
      </div>

      {showPrompts && (
        <ChatPromptHints onSend={onSendChat} disabled={chatSending || !chatConnected} />
      )}

      <ChatMessageList
        chatMessages={chatMessages}
        chatSending={chatSending}
        thinking={thinking}
        onSendChat={onSendChat}
        chatConnected={chatConnected}
        showPrompts={showPrompts}
      />

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
// app/student/courses/[id]/crawler/components/CrawlerChatSection.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bot, Database, Send, Copy, Check, Upload, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import type { UiMessage } from "../crawler-types";
import { formatDateTimeVN } from "@/utils/datetime/format-datetime";
import { renderMessageContent } from "../utils/chatFormatting";

// Avoid SSR issues for charts
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

type Props = {
  chatMessages: UiMessage[];
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onSendChat: (contentOverride?: string) => void;
  onUploadCsv?: (file: File) => Promise<void> | void;
  uploadingCsv?: boolean;
  chatSending: boolean;
  chatConnected: boolean;
  thinking?: boolean;
  onOpenResults?: () => void;
  resultsAvailable?: boolean;
};

type ApexAdapted = {
  options: ApexOptions;
  series: ApexOptions["series"];
  chartType: NonNullable<ApexOptions["chart"]>["type"];
  highlights: string[];
  height: number;
};

const fallbackColors = [
  "#4F46E5",
  "#22C55E",
  "#06B6D4",
  "#F59E0B",
  "#EF4444",
  "#8b5cf6",
  "#ec4899",
  "#6366f1",
];

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

// Convert backend payload into ApexCharts config
function buildApexConfig(rawJson: unknown): ApexAdapted | null {
  if (!rawJson) return null;

  try {
    const outer = safeParse(rawJson);
    const chartConfig = outer.visualizationData ?? outer.VisualizationData ?? outer;

    if (chartConfig?.data) {
      chartConfig.data = safeParse(chartConfig.data);
      if (chartConfig.data?.data) chartConfig.data.data = safeParse(chartConfig.data.data);
    }

    if (!chartConfig || !chartConfig.data) return null;

    const rawType =
      chartConfig.type ||
      chartConfig?.data?.chart?.type ||
      chartConfig?.chart?.type ||
      "bar";

    const normalizedType = typeof rawType === "string" ? rawType.trim().toLowerCase() : "";
    const allowedTypes = new Set([
      "bar",
      "column",
      "line",
      "area",
      "pie",
      "donut",
      "radar",
      "polararea",
      "scatter",
      "bubble",
      "heatmap",
    ]);

    let chartType: NonNullable<ApexOptions["chart"]>["type"] = "bar";
    if (normalizedType === "column") {
      chartType = "bar";
    } else if (allowedTypes.has(normalizedType as any)) {
      chartType = normalizedType as NonNullable<ApexOptions["chart"]>["type"];
    }

    const dataNode =
      chartConfig?.data?.data ?? chartConfig?.data ?? chartConfig?.dataset ?? {};

    const rawSeries =
      dataNode.series ?? chartConfig?.series ?? chartConfig?.data?.series ?? [];
    const rawLabels = dataNode.labels ?? dataNode.categories ?? chartConfig?.labels ?? [];

    const colors = chartConfig?.data?.colors || chartConfig?.colors || fallbackColors;
    const legendPosition = chartConfig?.options?.plugins?.legend?.position || "bottom";
    const titleText =
      chartConfig?.data?.chart?.title || chartConfig?.chart?.title || chartConfig?.title;

    const highlights = (outer.insightHighlights || outer.InsightHighlights || []) as string[];

    // --- PIE / DONUT ---
    if (chartType === "pie" || chartType === "donut") {
      const series =
        Array.isArray(rawSeries) && rawSeries.length && typeof rawSeries[0] === "number"
          ? rawSeries
          : Array.isArray(dataNode.values)
          ? dataNode.values
          : [];

      const finalSeries = (Array.isArray(series) ? series : []) as number[];
      const labels = Array.isArray(rawLabels) ? rawLabels : [];

      const baseHeight = 320 * 0.6;
      const legendHeight = labels.length > 5 ? (labels.length - 5) * 25 * 0.6 : 0;
      const chartHeight = Math.min(1000 * 0.6, baseHeight + legendHeight);

      const options: ApexOptions = {
        chart: { toolbar: { show: false }, height: chartHeight },
        labels,
        colors,
        legend: {
          position: "bottom",
          formatter: (seriesName: string) =>
            seriesName.length > 40 ? seriesName.slice(0, 40) + "..." : seriesName,
        },
        dataLabels: {
          enabled: true,
          dropShadow: { enabled: false },
          style: { fontSize: "11px", fontWeight: 600, colors: ["#fff"] },
          formatter: (val: number) => Math.round(val) + "%",
        },
        tooltip: { y: { formatter: (val: number) => String(val) } },
        stroke: { colors: ["#fff"], width: 1 },
        title: titleText ? { text: titleText, style: { fontSize: "14px" } } : undefined,
      };

      return { options, series: finalSeries, chartType, height: chartHeight, highlights };
    }

    // --- BAR / LINE / AREA ---
    const categories = Array.isArray(dataNode.categories)
      ? dataNode.categories
      : Array.isArray(rawLabels)
      ? rawLabels
      : [];

    const categoriesCount = categories.length;
    const hasLongLabels = categories.some((c: any) => String(c).length > 24);
    const horizontal = chartType === "bar" && (categoriesCount > 8 || hasLongLabels);
    const showDataLabels = categoriesCount <= 12;

    const rowHeight = horizontal ? 48 : 26;
    const basePadding = horizontal ? 280 : 160;
    const rawHeight = Math.max(320, Math.min(900, categoriesCount * rowHeight + basePadding));
    const sizingScale = horizontal ? 0.75 : 0.6; // keep horizontals airy enough to read
    const chartHeight = rawHeight * sizingScale;

    let series: any[] = [];
    if (Array.isArray(rawSeries) && rawSeries.length) {
      const isNumberSeries = rawSeries.every((s: any) => typeof s === "number");
      const isObjectSeries = rawSeries.every((s: any) => Array.isArray((s as any)?.data));

      if (isNumberSeries) {
        series = [{ name: titleText || "Data", data: rawSeries as number[] }];
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
        animations: { enabled: true, ...({ easing: "easeinout" } as any) },
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
              barHeight: horizontal ? "55%" : undefined,
            },
          }
        : undefined,
      dataLabels: {
        enabled: showDataLabels,
        formatter: (val: number | string) => String(val),
        style: { fontSize: "11px", fontWeight: 600 },
        background: { enabled: false },
      },
      stroke: { width: isBar ? 0 : 3, curve: "smooth" },
      grid: { borderColor: "#E2E8F0", strokeDashArray: 4 },
      xaxis: {
        categories,
        labels: {
          style: { colors: "#64748b" },
          rotate: horizontal ? 0 : -25,
          formatter: (val: string | number) => {
            const str = String(val);
            return str.length > 28 ? `${str.slice(0, 28)}…` : str;
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: { labels: { style: { colors: "#94a3b8" }, formatter: (v: number) => String(v) } },
      legend: {
        position: legendPosition as any,
        markers: { radius: 12 } as any,
        show: series.length > 1 || (series.length === 1 && isBar),
      },
      title: titleText
        ? { text: titleText, style: { fontSize: "14px", fontWeight: 700 } }
        : undefined,
      tooltip: { theme: "light", y: { formatter: (val: number) => String(val) } },
    };

    return { options, series, chartType, height: chartHeight, highlights };
  } catch (err) {
    console.error("Failed to parse visualizationData:", err, rawJson);
    return null;
  }
}

// ===== Clipboard / Download helpers =====
async function tryCopyBlobImage(blob: Blob) {
  if (typeof window === "undefined") return false;
  if (!("ClipboardItem" in window)) return false;
  if (!navigator?.clipboard?.write) return false;

  try {
    const type = blob.type || "image/png";
    const item = new ClipboardItem({ [type]: blob });
    await navigator.clipboard.write([item]);
    return true;
  } catch {
    return false;
  }
}

async function tryCopyText(text: string) {
  if (!navigator?.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function downloadDataUrl(dataUrl: string, filename: string) {
  if (typeof document === "undefined") return;
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const ChatVisualization = ({ rawJson }: { rawJson: unknown }) => {
  const adapted = useMemo(() => buildApexConfig(rawJson), [rawJson]);

  // Lưu instance Apex chart từ events.mounted/updated
  const chartInstanceRef = useRef<any>(null);

  const chartIdRef = useRef<string>(
    `viz_${Math.random().toString(36).slice(2)}_${Date.now()}`
  );

  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "loading" | "copied" | "error">("idle");

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const scheduleReset = useCallback(() => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => setCopyState("idle"), 2000);
  }, []);

const handleCopyImage = useCallback(async () => {
  if (!adapted) return;

  const inst = chartInstanceRef.current;
  setCopyState("loading");

  const SCALE = 5;  

  try {
    if (!inst || typeof inst.dataURI !== "function") {
      setCopyState("error");
      scheduleReset();
      return;
    }

    // 1) Try native scale (nếu version Apex support)
    let data: any = null;
    try {
      data = await inst.dataURI({ scale: SCALE });
    } catch {
      data = await inst.dataURI(); // fallback scale default
    }

    let imgURI: string | undefined = data?.imgURI;
    const svgURI: string | undefined = data?.svgURI;

    // 2) Nếu imgURI nhỏ/mờ hoặc không có -> render từ SVG ra PNG scale cao
    if ((!imgURI || !imgURI.startsWith("data:")) && svgURI && svgURI.startsWith("data:")) {
      const svgText = decodeURIComponent(svgURI.split(",")[1] || "");
      const svgBlob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.decoding = "async";
      img.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (e) => reject(e);
        img.src = svgUrl;
      });

      const baseW = img.naturalWidth || (inst?.w?.globals?.svgWidth ?? 800);
      const baseH = img.naturalHeight || (inst?.w?.globals?.svgHeight ?? 400);

      const canvas = document.createElement("canvas");
      canvas.width = Math.round(baseW * SCALE);
      canvas.height = Math.round(baseH * SCALE);

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context not available");

      // scale để nét
      ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      imgURI = canvas.toDataURL("image/png", 1.0);

      URL.revokeObjectURL(svgUrl);
    }

    if (!imgURI || !imgURI.startsWith("data:")) {
      setCopyState("error");
      scheduleReset();
      return;
    }

    // 3) copy blob PNG
    const res = await fetch(imgURI);
    const blob = await res.blob();

    const copiedImg = await tryCopyBlobImage(blob);
    if (copiedImg) {
      setCopyState("copied");
      scheduleReset();
      return;
    }

    // fallback copy dataUrl / download
    const copiedUrl = await tryCopyText(imgURI);
    if (!copiedUrl) downloadDataUrl(imgURI, "chart@3x.png");

    setCopyState("copied");
  } catch (err) {
    console.error("Copy high-res chart failed", err);
    setCopyState("error");
  } finally {
    scheduleReset();
  }
}, [adapted, scheduleReset]);


  if (!adapted) return null;

  const { highlights, options, series, chartType, height } = adapted;

  // IMPORTANT: gắn events để lấy instance chart, KHÔNG dùng ApexCharts.exec nữa
  const optionsWithCapture: ApexOptions = useMemo(() => {
    const prevChart = options.chart || {};
    const prevEvents = (prevChart as any).events || {};

    return {
      ...options,
      chart: {
        ...prevChart,
        id: chartIdRef.current,
        toolbar: { show: false, ...(prevChart as any).toolbar },
        events: {
          ...prevEvents,
          mounted: (chartCtx: any) => {
            chartInstanceRef.current = chartCtx;
            if (typeof prevEvents.mounted === "function") prevEvents.mounted(chartCtx);
          },
          updated: (chartCtx: any) => {
            chartInstanceRef.current = chartCtx;
            if (typeof prevEvents.updated === "function") prevEvents.updated(chartCtx);
          },
        },
      } as any,
    };
  }, [options]);

  const isLoading = copyState === "loading";
  const copyLabel =
    copyState === "copied"
      ? "Copied"
      : copyState === "error"
      ? "Try again"
      : isLoading
      ? "Copying..."
      : "Copy image";
  const CopyIcon = copyState === "copied" ? Check : Copy;

  return (
    <div className="mt-2.5 flex flex-col gap-2 rounded-md border border-slate-200 bg-white p-2.5 shadow-sm">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={handleCopyImage}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-white px-2 py-1 text-[10px] font-medium text-[var(--foreground)] shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CopyIcon className="h-3.5 w-3.5 text-[var(--brand)]" />
          <span>{copyLabel}</span>
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {highlights && highlights.length > 0 && (
          <div className="text-[11px] text-slate-700">
            <strong className="mb-0.5 block text-[var(--brand)]">Key Insights:</strong>
            <ul className="space-y-0.5 list-disc pl-4">
              {highlights.map((hl: string, idx: number) => (
                <li key={idx}>{hl}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-0.5 w-full" style={{ height }}>
          <ReactApexChart
            type={chartType}
            options={optionsWithCapture}
            series={series}
            height={height}
            width="100%"
          />
        </div>
      </div>
    </div>
  );
};

const ChatMessageList = React.memo(function ChatMessageList({
  chatMessages,
  chatSending,
  thinking,
}: Pick<Props, "chatMessages" | "chatSending" | "thinking">) {
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [chatMessages.length, thinking, chatSending]);

  return (
    <div
      ref={listRef}
      data-prevent-tab-hide="true"
      className="scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent flex-1 min-h-0 space-y-2.5 rounded-lg border border-[var(--border)] bg-slate-50/50 px-2.5 py-2.5 overflow-y-auto"
    >
      {chatMessages.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-[11px] text-[var(--text-muted)] opacity-80">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand)]/10 text-[var(--brand)]">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] text-[var(--text-muted)]">Start by asking the agent.</p>
          </div>
        </div>
      ) : (
        chatMessages.map((m) => {
          const rendered = renderMessageContent(m.content || "");
          const isUserMessage = m.role === "user";
          const baseContentClass =
            "text-[11px] leading-relaxed space-y-0.5 [&_ul]:ml-3 [&_ul]:list-disc [&_ul]:list-inside [&_ol]:ml-3 [&_ol]:list-decimal [&_ol]:list-inside [&_li]:mb-0.5 [&_a]:underline [&_a]:underline-offset-2 [&_a]:break-words [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[9px] [&_strong]:font-semibold [&_p]:last:mb-0 [&_img[data-inline-img]]:my-1.5 [&_img[data-inline-img]]:max-h-52 [&_img[data-inline-img]]:rounded-md [&_img[data-inline-img]]:border [&_img[data-inline-img]]:border-[var(--border)] [&_img[data-inline-img]]:bg-white";
const anchorToneClass = isUserMessage
  ? "[&_a]:!text-amber-200 [&_a:visited]:!text-amber-200 [&_a]:decoration-amber-200/60 [&_a:hover]:!text-amber-50 [&_a:focus-visible]:!text-amber-50"
  : "[&_a]:text-[#2563eb] [&_a:visited]:text-[#1d4ed8] [&_a]:decoration-[#2563eb]/50 [&_a:hover]:text-[#1d4ed8] [&_a:focus-visible]:text-[#1d4ed8]";

          const headingClass =
            "[&_h1]:mt-2 [&_h1]:mb-1 [&_h1]:text-[12px] [&_h1]:font-semibold [&_h1]:leading-snug [&_h1]:tracking-tight [&_h1]:text-current [&_h2]:mt-2 [&_h2]:mb-1 [&_h2]:text-[11.5px] [&_h2]:font-semibold [&_h2]:leading-snug [&_h2]:tracking-tight [&_h2]:text-current [&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:text-[11px] [&_h3]:font-semibold [&_h3]:leading-snug [&_h3]:tracking-tight [&_h3]:text-current [&_h4]:mt-1.5 [&_h4]:mb-1 [&_h4]:text-[10.5px] [&_h4]:font-semibold [&_h4]:tracking-tight [&_h4]:text-current";
          const contentClass = `${baseContentClass} ${anchorToneClass} ${headingClass}`;
          return (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`relative group max-w-[85%] rounded-xl px-3 py-2 text-[11px] leading-relaxed shadow-sm ${
                  m.role === "user"
                    ? "rounded-br-sm bg-[var(--brand)] text-white"
                    : m.role === "system"
                    ? "rounded-md border border-slate-200 bg-slate-100 text-[10px] text-slate-700"
                    : "rounded-bl-sm border border-[var(--border)] bg-white text-slate-800"
                }`}
              >
                <div className={contentClass} dangerouslySetInnerHTML={{ __html: rendered.html }} />

                {m.extractedData && (
                  <div className="mt-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[9px] text-slate-700">
                    <div className="mb-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                      Extracted data
                    </div>
                    <div className="whitespace-pre-line">{m.extractedData}</div>
                  </div>
                )}

                {m.visualizationData && <ChatVisualization rawJson={m.visualizationData} />}

                <div
                  className={`mt-0.5 flex items-center justify-end gap-1.5 text-[9px] opacity-70 ${
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
          <div className="thinking-chip" role="status" aria-live="polite">
            <span className="thinking-label">Thinking</span>
            <span className="thinking-loader" aria-hidden="true" />
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
  onUploadCsv,
  uploadingCsv = false,
  chatSending,
  chatConnected,
  thinking = false,
  onOpenResults,
  resultsAvailable = false,
}: Props) {
  const disabledSend = !chatInput.trim() || chatSending || !chatConnected;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadButtonClick = useCallback(() => {
    if (!onUploadCsv || uploadingCsv || !chatConnected) return;
    fileInputRef.current?.click();
  }, [chatConnected, onUploadCsv, uploadingCsv]);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file || !onUploadCsv) return;
      await onUploadCsv(file);
    },
    [onUploadCsv]
  );

  const uploadDisabled = !onUploadCsv || uploadingCsv || !chatConnected;

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
          {onOpenResults && (
            <button
              type="button"
              onClick={onOpenResults}
              className={`inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] px-2.5 py-0.5 text-[9px] font-medium transition ${
                resultsAvailable
                  ? "text-[var(--foreground)] hover:bg-slate-50"
                  : "text-[var(--text-muted)]"
              }`}
              aria-disabled={!resultsAvailable}
            >
              <Database className="h-3 w-3 text-[var(--brand)]" />
              View Crawled Data
            </button>
          )}
        </div>
      </div>

      <ChatMessageList chatMessages={chatMessages} chatSending={chatSending} thinking={thinking} />

      <div className="mt-1.5 flex items-end gap-1.5">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={handleUploadButtonClick}
          disabled={uploadDisabled}
          className="flex h-[36px] items-center gap-1 rounded-lg border border-dashed border-[var(--border)] bg-slate-50/70 px-2.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--brand)] transition hover:bg-[var(--brand)]/10 disabled:cursor-not-allowed disabled:opacity-60"
          title="Upload CSV file"
        >
          {uploadingCsv ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          <span>Upload CSV</span>
        </button>
        <textarea
          rows={1}
          value={chatInput}
          onChange={(e) => onChatInputChange(e.target.value)}
          placeholder="Ask about the data..."
          className="min-h-[36px] max-h-[96px] flex-1 resize-none rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-[12px] outline-none transition-all placeholder:text-slate-400 focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--focus-ring)]"
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
    </div>
  );
}

export default React.memo(CrawlerChatSection);

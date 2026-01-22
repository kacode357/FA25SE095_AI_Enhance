// app/student/courses/[id]/crawler/components/CrawlerChatMessageList.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bot, Copy, Check } from "lucide-react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import katex from "katex";
import "katex/dist/katex.min.css";

import type { UiMessage } from "../crawler-types";
import { formatDateTimeVN } from "@/utils/datetime/format-datetime";
import { renderMessageContent } from "../utils/chatFormatting";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

type ApexAdapted = {
  options: ApexOptions;
  series: ApexOptions["series"];
  chartType: NonNullable<ApexOptions["chart"]>["type"];
  highlights: string[];
  height: number;
  maxViewportHeight: number;
};

export type CrawlerChatMessageListProps = {
  chatMessages: UiMessage[];
  chatSending: boolean;
  thinking?: boolean;
  chatReady?: boolean;
  disableAutoScroll?: boolean;
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

function normalizeChartType(raw: unknown): NonNullable<ApexOptions["chart"]>["type"] {
  const rawStr = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  const allowed = new Set([
    "bar",
    "column",
    "line",
    "area",
    "pie",
    "radar",
    "polararea",
    "scatter",
    "bubble",
    "heatmap",
  ]);

  if (rawStr === "column") return "bar";
  if (rawStr === "donut") return "pie";
  if (allowed.has(rawStr as any)) return rawStr as NonNullable<ApexOptions["chart"]>["type"];
  return "bar";
}

function buildApexConfig(rawJson: unknown): ApexAdapted | null {
  if (!rawJson) return null;

  try {
    const outer = safeParse(rawJson);
    const chartConfig = outer?.visualizationData ?? outer?.VisualizationData ?? outer;

    if (chartConfig?.data) {
      chartConfig.data = safeParse(chartConfig.data);
      if (chartConfig.data?.data) chartConfig.data.data = safeParse(chartConfig.data.data);
    }

    if (!chartConfig) return null;

    const rawType =
      chartConfig?.type || chartConfig?.data?.chart?.type || chartConfig?.chart?.type || "bar";
    const chartType = normalizeChartType(rawType);

    const dataNode = chartConfig?.data?.data ?? chartConfig?.data ?? chartConfig?.dataset ?? {};

    const rawSeries = dataNode?.series ?? chartConfig?.series ?? chartConfig?.data?.series ?? [];
    const rawLabels = dataNode?.labels ?? dataNode?.categories ?? chartConfig?.labels ?? [];

    const colors = chartConfig?.data?.colors || chartConfig?.colors || fallbackColors;

    const legendPosition =
      chartConfig?.options?.plugins?.legend?.position ||
      chartConfig?.data?.options?.plugins?.legend?.position ||
      "bottom";

    const titleText =
      chartConfig?.data?.chart?.title || chartConfig?.chart?.title || chartConfig?.title;

    const highlights = (outer?.insightHighlights || outer?.InsightHighlights || []) as string[];

    if (chartType === "pie") {
      const series =
        Array.isArray(rawSeries) && rawSeries.length && typeof rawSeries[0] === "number"
          ? rawSeries
          : Array.isArray(dataNode?.values)
          ? dataNode.values
          : [];

      const finalSeries = (Array.isArray(series) ? series : []) as number[];
      const labels = Array.isArray(rawLabels) ? rawLabels : [];

      const baseHeight = 320;
      const legendExtra = labels.length > 6 ? (labels.length - 6) * 18 : 0;
      const height = Math.max(300, Math.min(700, baseHeight + legendExtra));

      const options: ApexOptions = {
        chart: { toolbar: { show: false }, height },
        labels,
        colors,
        legend: {
          position: "bottom",
          formatter: (seriesName: string) =>
            seriesName.length > 42 ? seriesName.slice(0, 42) + "..." : seriesName,
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

      return {
        options,
        series: finalSeries,
        chartType,
        height,
        maxViewportHeight: Math.min(520, height),
        highlights,
      };
    }

    const categories = Array.isArray(dataNode?.categories)
      ? dataNode.categories
      : Array.isArray(rawLabels)
      ? rawLabels
      : [];

    const categoriesCount = categories.length;
    const hasLongLabels = categories.some((c: any) => String(c).length > 24);

    const horizontal = chartType === "bar" && (categoriesCount > 8 || hasLongLabels);
    const showDataLabels = categoriesCount <= 12;

    const MIN_H = 360;
    const MAX_H = 2200;
    const rowHeight = horizontal ? 28 : 22;
    const basePadding = horizontal ? 220 : 160;

    let height = Math.round(categoriesCount * rowHeight + basePadding);
    height = Math.max(MIN_H, Math.min(MAX_H, height));

    const maxViewportHeight =
      categoriesCount > 14 || hasLongLabels ? 520 : Math.min(520, height);

    let series: any[] = [];

    if (Array.isArray(rawSeries) && rawSeries.length) {
      const isNumberSeries = rawSeries.every((s: any) => typeof s === "number");
      const isObjectSeries = rawSeries.every((s: any) => Array.isArray((s as any)?.data));

      if (isNumberSeries) {
        series = [{ name: titleText || "Data", data: rawSeries as number[] }];
      } else if (isObjectSeries) {
        series = rawSeries.map((s: any, idx: number) => ({
          name: s?.name || `Series ${idx + 1}`,
          data: s?.data || [],
        }));
      }
    }

    if (!series || series.length === 0) return null;

    const isBar = chartType === "bar";

    const options: ApexOptions = {
      chart: {
        toolbar: { show: false },
        animations: { enabled: true, ...({ easing: "easeinout" } as any) },
        height,
      },
      colors,
      plotOptions: isBar
        ? {
            bar: {
              borderRadius: 4,
              columnWidth: "55%",
              distributed: series.length === 1,
              horizontal,
              barHeight: horizontal ? "70%" : undefined,
              dataLabels: { position: horizontal ? "right" : "top" },
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
          style: { colors: "#64748b", fontSize: "10px" },
          rotate: horizontal ? 0 : -25,
          formatter: (val: string | number) => {
            const str = String(val);
            return str.length > 32 ? `${str.slice(0, 32)}...` : str;
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: "#94a3b8", fontSize: "10px" },
          formatter: (v: number) => String(v),
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
      tooltip: { theme: "light", y: { formatter: (val: number) => String(val) } },
    };

    return { options, series, chartType, height, maxViewportHeight, highlights };
  } catch {
    return null;
  }
}

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

  const chartInstanceRef = useRef<any>(null);
  const chartIdRef = useRef<string>(`viz_${Math.random().toString(36).slice(2)}_${Date.now()}`);
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

    const SCALE = 4;

    try {
      if (!inst || typeof inst.dataURI !== "function") {
        setCopyState("error");
        scheduleReset();
        return;
      }

      let data: any = null;
      try {
        data = await inst.dataURI({ scale: SCALE });
      } catch {
        data = await inst.dataURI();
      }

      let imgURI: string | undefined = data?.imgURI;
      const svgURI: string | undefined = data?.svgURI;

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

        const baseW = img.naturalWidth || inst?.w?.globals?.svgWidth || 900;
        const baseH = img.naturalHeight || inst?.w?.globals?.svgHeight || 520;

        const canvas = document.createElement("canvas");
        canvas.width = Math.round(baseW * SCALE);
        canvas.height = Math.round(baseH * SCALE);

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context not available");

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(img, 0, 0);

        imgURI = canvas.toDataURL("image/png", 1.0);

        URL.revokeObjectURL(svgUrl);
      }

      if (!imgURI || !imgURI.startsWith("data:")) {
        setCopyState("error");
        scheduleReset();
        return;
      }

      const res = await fetch(imgURI);
      const blob = await res.blob();

      const copiedImg = await tryCopyBlobImage(blob);
      if (copiedImg) {
        setCopyState("copied");
        scheduleReset();
        return;
      }

      const copiedUrl = await tryCopyText(imgURI);
      if (!copiedUrl) downloadDataUrl(imgURI, "chart@2x.png");

      setCopyState("copied");
    } catch {
      setCopyState("error");
    } finally {
      scheduleReset();
    }
  }, [adapted, scheduleReset]);

  if (!adapted) return null;

  const { highlights, options, series, chartType, height, maxViewportHeight } = adapted;

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
            <ul className="list-disc space-y-0.5 pl-4">
              {highlights.map((hl: string, idx: number) => (
                <li key={idx}>{hl}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-0.5 w-full overflow-y-auto rounded-md" style={{ maxHeight: maxViewportHeight }}>
          <div style={{ height }}>
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
    </div>
  );
};

const CrawlerChatMessageList = React.memo(function CrawlerChatMessageList({
  chatMessages,
  chatSending,
  thinking,
  disableAutoScroll = false,
  chatReady = true,
}: CrawlerChatMessageListProps) {
  const listRef = useRef<HTMLDivElement | null>(null);

  // Render KaTeX expressions
  useEffect(() => {
    if (!listRef.current) return;
    
    // Render block math expressions
    const blockMathElements = listRef.current.querySelectorAll('.math-block[data-latex="block"]');
    blockMathElements.forEach((element) => {
      try {
        const mathContent = element.textContent || '';
        // Remove the $$ delimiters
        const latex = mathContent.replace(/^\$\$/, '').replace(/\$\$$/, '').trim();
        katex.render(latex, element as HTMLElement, {
          displayMode: true,
          throwOnError: false,
          output: 'html',
          trust: false
        });
      } catch (error) {
        console.error('KaTeX block render error:', error);
      }
    });

    // Render inline math expressions
    const inlineMathElements = listRef.current.querySelectorAll('.math-inline[data-latex="inline"]');
    inlineMathElements.forEach((element) => {
      try {
        const mathContent = element.textContent || '';
        // Remove the $ delimiters
        const latex = mathContent.replace(/^\$/, '').replace(/\$$/, '').trim();
        katex.render(latex, element as HTMLElement, {
          displayMode: false,
          throwOnError: false,
          output: 'html',
          trust: false
        });
      } catch (error) {
        console.error('KaTeX inline render error:', error);
      }
    });
  }, [chatMessages]);

  useEffect(() => {
    if (disableAutoScroll) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [chatMessages.length, thinking, chatSending, disableAutoScroll]);

  return (
    <div
      ref={listRef}
      data-prevent-tab-hide="true"
      className="scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent flex-1 min-h-0 space-y-2.5 overflow-y-auto rounded-lg border border-[var(--border)] bg-slate-50/50 px-2.5 py-2.5"
    >
      {chatMessages.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-[11px] text-[var(--text-muted)] opacity-80">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand)]/10 text-[var(--brand)]">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] text-[var(--text-muted)]">
              {chatReady ? "Start by asking the agent." : "Start a crawl or select a conversation to chat."}
            </p>
          </div>
        </div>
      ) : (
        <>
          {chatMessages.map((m) => {
            const rendered = renderMessageContent(m.content || "");
            const isUserMessage = m.role === "user";

            const baseContentClass =
              "text-[11px] leading-relaxed space-y-0.5 [&_ul]:ml-4 [&_ul]:list-disc [&_ul]:list-outside [&_ol]:ml-5 [&_ol]:list-decimal [&_ol]:list-outside [&_li]:mb-0.5 [&_a]:underline [&_a]:underline-offset-2 [&_a]:break-words [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[9px] [&_strong]:font-semibold [&_p]:last:mb-0 [&_.inline-image-block]:my-1.5 [&_figure.inline-image]:my-0 [&_figure.inline-image]:overflow-hidden [&_figure.inline-image]:rounded-md [&_figure.inline-image]:border [&_figure.inline-image]:border-[var(--border)] [&_figure.inline-image]:bg-white [&_figure.inline-image>img]:block [&_figure.inline-image>img]:w-full [&_figure.inline-image>img]:max-h-52 [&_figure.inline-image>img]:object-cover [&_figure.inline-image>figcaption]:px-2 [&_figure.inline-image>figcaption]:py-1 [&_figure.inline-image>figcaption]:text-[9px] [&_figure.inline-image>figcaption]:font-medium [&_figure.inline-image>figcaption]:text-slate-500";

            const anchorToneClass = isUserMessage
              ? "[&_a]:!text-amber-200 [&_a:visited]:!text-amber-200 [&_a]:decoration-amber-200/60 [&_a:hover]:!text-amber-50 [&_a:focus-visible]:!text-amber-50"
              : "[&_a]:text-[#2563eb] [&_a:visited]:text-[#1d4ed8] [&_a]:decoration-[#2563eb]/50 [&_a:hover]:text-[#1d4ed8] [&_a:focus-visible]:text-[#1d4ed8]";

            const headingClass =
              "[&_h1]:mt-2 [&_h1]:mb-1 [&_h1]:text-[12px] [&_h1]:font-semibold [&_h1]:leading-snug [&_h1]:tracking-tight [&_h1]:text-current [&_h2]:mt-2 [&_h2]:mb-1 [&_h2]:text-[11.5px] [&_h2]:font-semibold [&_h2]:leading-snug [&_h2]:tracking-tight [&_h2]:text-current [&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:text-[11px] [&_h3]:font-semibold [&_h3]:leading-snug [&_h3]:tracking-tight [&_h3]:text-current [&_h4]:mt-1.5 [&_h4]:mb-1 [&_h4]:text-[10.5px] [&_h4]:font-semibold [&_h4]:tracking-tight [&_h4]:text-current";

            const contentClass = `${baseContentClass} ${anchorToneClass} ${headingClass}`;

            return (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`relative group max-w-[85%] rounded-xl px-3 py-2 text-[11px] leading-relaxed shadow-sm ${
                    m.role === "user"
                      ? "rounded-br-sm bg-[var(--brand)] text-white"
                      : m.role === "system"
                      ? "rounded-md border border-slate-200 bg-slate-100 text-[10px] text-slate-700"
                      : "rounded-bl-sm border border-[var(--border)] bg-white text-slate-800"
                  }`}
                >
                  {rendered.html ? (
                    <div className={contentClass} dangerouslySetInnerHTML={{ __html: rendered.html }} />
                  ) : null}

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
          })}
        </>
      )}

      {(chatSending || thinking) && (
        <div className="flex justify-start">
          <div className="thinking-chip" role="status" aria-live="polite">
            <span className="thinking-label">Thinking</span>
          </div>
        </div>
      )}
    </div>
  );
});

export default CrawlerChatMessageList;

"use client";

import React, { useState, useEffect, useRef } from "react";
import wsService from "@/services/agent-training.websocket";
import type { CrawlLogEntry } from "@/types/agent-training/training.types";

interface CrawlLogConsoleProps {
  jobId: string | null;
  isActive: boolean;
}

export const CrawlLogConsole: React.FC<CrawlLogConsoleProps> = ({
  jobId,
  isActive,
}) => {
  const [logs, setLogs] = useState<CrawlLogEntry[]>([]);
  const consoleRef = useRef<HTMLDivElement>(null);

  // Lắng nghe WebSocket event "crawl_log" để nhận real-time logs
  useEffect(() => {
    const handleLog = (data: any) => {
      const log: CrawlLogEntry = {
        level: data.level || "INFO",
        message: data.message || "",
        logger: data.logger || "",
        timestamp: data.timestamp || new Date().toISOString(),
        job_id: data.job_id || null,
      };

      // Filter: Chỉ hiển log của job hiện tại hoặc tất cả nếu jobId = null
      if (jobId === null || log.job_id === jobId) {
        setLogs((prev) => [...prev, log]);
      }
    };

    wsService.on("crawl_log", handleLog);

    return () => {
      wsService.off("crawl_log", handleLog);
    };
  }, [jobId]);

  // Tự động scroll xuống cuối khi có log mới
  useEffect(() => {
    if (consoleRef.current) {
      const node = consoleRef.current;
      node.scrollTo({
        top: node.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [logs]);

  // Xóa logs cũ khi start job mới
  useEffect(() => {
    if (isActive && jobId) {
      setLogs([]);
    }
  }, [jobId, isActive]);

  const handleClear = () => {
    setLogs([]);
  };

  // Lấy loại log từ message (ví dụ: [INIT], [FETCH], [ERROR])
  const getLogType = (message: string): string => {
    const match = message.match(/\[(\w+)\]/);
    return match ? match[1].toLowerCase() : "info";
  };

  // Format timestamp thành HH:MM:SS.mmm
  const formatTime = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const seconds = date.getSeconds().toString().padStart(2, "0");
      const ms = date.getMilliseconds().toString().padStart(3, "0");
      return `${hours}:${minutes}:${seconds}.${ms}`;
    } catch {
      return timestamp;
    }
  };

  // Trả về class màu dựa trên loại log
  const colorClass = (message: string) => {
    const t = getLogType(message);
    if (t === "init") return "text-sky-300";
    if (t === "plan") return "text-fuchsia-300";
    if (t === "fetch") return "text-amber-200";
    if (t === "nav") return "text-teal-200";
    if (t === "scrape") return "text-emerald-300";
    if (t === "complete") return "text-teal-200";
    if (t === "warning") return "text-amber-300";
    if (t === "error") return "text-rose-300";
    return "text-slate-100";
  };

  return (
    <div className="flex h-[520px] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between bg-slate-50 px-3 py-2">
        <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
          <span>🔍 Crawl Logs</span>
          {logs.length > 0 && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700">
              {logs.length}
            </span>
          )}
        </span>
        <button
          type="button"
          onClick={handleClear}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-50"
        >
          Clear
        </button>
      </div>

      <div
        ref={consoleRef}
        className="flex-1 overflow-y-auto bg-slate-950 px-3 py-2 text-xs font-mono text-slate-100"
      >
          {logs.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center text-slate-400">
              No crawl activity yet. Start a crawl to see live logs here.
            </div>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="py-0.5">
                <span className="mr-2 text-[10px] text-slate-500">
                  {formatTime(log.timestamp)}
                </span>
                <span className={colorClass(log.message)}>{log.message}</span>
              </div>
            ))
          )}
        </div>
    </div>
  );
};

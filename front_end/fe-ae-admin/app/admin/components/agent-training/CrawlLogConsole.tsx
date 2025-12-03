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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleLog = (data: any) => {
      const log: CrawlLogEntry = {
        level: data.level || "INFO",
        message: data.message || "",
        logger: data.logger || "",
        timestamp: data.timestamp || new Date().toISOString(),
        job_id: data.job_id || null,
      };

      if (jobId === null || log.job_id === jobId) {
        setLogs((prev) => [...prev, log]);
      }
    };

    wsService.on("crawl_log", handleLog);

    return () => {
      wsService.off("crawl_log", handleLog);
    };
  }, [jobId]);

  useEffect(() => {
    if (!isCollapsed && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isCollapsed]);

  useEffect(() => {
    if (isActive && jobId) {
      setLogs([]);
    }
  }, [jobId, isActive]);

  const handleClear = () => {
    setLogs([]);
  };

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const getLogType = (message: string): string => {
    const match = message.match(/\[(\w+)\]/);
    return match ? match[1].toLowerCase() : "info";
  };

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

  if (!isActive && logs.length === 0) return null;

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
    <div
      className={`mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${
        isCollapsed ? "max-h-11" : "max-h-96"
      } transition-all duration-300`}
    >
      <button
        type="button"
        onClick={toggleCollapse}
        className="flex w-full items-center justify-between bg-slate-50 px-3 py-2 text-left text-xs text-slate-700"
      >
        <span className="inline-flex items-center gap-2 font-medium">
          <span>{isCollapsed ? "▶" : "▼"}</span>
          <span>🔍 Crawl Logs</span>
          {logs.length > 0 && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700">
              {logs.length}
            </span>
          )}
        </span>
        {!isCollapsed && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-50"
          >
            Clear
          </button>
        )}
      </button>

      {!isCollapsed && (
        <div className="max-h-80 overflow-y-auto bg-slate-950 px-3 py-2 text-xs font-mono text-slate-100">
          {logs.length === 0 ? (
            <div className="py-5 text-center text-slate-400">
              No logs yet. Start a crawl to see real-time logs.
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
          <div ref={logEndRef} />
        </div>
      )}
    </div>
  );
};

"use client";

import { Wifi, WifiOff } from "lucide-react";

type Props = {
  chatHubConnected: boolean;
  chatConnectionId: string | null;
  crawlHubConnected: boolean;
  crawlerStatusText: string | null;
  onReconnectChatHub: () => void;
  reconnectingChatHub: boolean;
};

export default function CrawlerHeaderBar({
  chatHubConnected,
  chatConnectionId,
  crawlHubConnected,
  crawlerStatusText,
  onReconnectChatHub,
  reconnectingChatHub,
}: Props) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-nav">
          Crawler Workspace
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Nhắn tin để hệ thống crawl &amp; phân tích tài liệu theo assignment.
        </p>
      </div>

      <div className="flex flex-col items-end gap-1 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border px-2 py-1 bg-white">
            {chatHubConnected ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            <span>{chatHubConnected ? "Chat hub connected" : "Chat hub disconnected"}</span>
          </div>
          {chatConnectionId && (
            <span className="hidden sm:inline text-[11px] text-slate-400">
              #{chatConnectionId.slice(0, 8)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border px-2 py-1 bg-white text-[11px]">
            <span
              className={
                "inline-flex h-2 w-2 rounded-full " +
                (crawlHubConnected ? "bg-emerald-500" : "bg-slate-300")
              }
            />
            <span>Crawl hub: {crawlHubConnected ? "connected" : "disconnected"}</span>
          </div>

          {crawlerStatusText && (
            <span className="text-[11px] text-slate-500">
              Status: <span className="font-medium">{crawlerStatusText}</span>
            </span>
          )}

          {!chatHubConnected && (
            <button
              type="button"
              className="text-[11px] text-indigo-600 underline-offset-2 hover:underline"
              onClick={onReconnectChatHub}
              disabled={reconnectingChatHub}
            >
              {reconnectingChatHub ? "Đang kết nối lại..." : "Reconnect chat hub"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// app/student/courses/[id]/reports/components/ReportCollabClient.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useReportCollabHub } from "@/hooks/hubcollab/useReportCollabHub";
import type {
  Guid,
  ReportChangeDto,
  CollaboratorPresenceDto,
} from "@/hooks/hubcollab/useReportCollabHub";
import { Users, Wifi, WifiOff, Activity } from "lucide-react";

/** ============ Utils ============ */

function initials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const one = parts[0]?.[0] ?? "";
  const two = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
  return (one + two).toUpperCase();
}

function htmlDifferent(a?: string | null, b?: string | null) {
  return (a ?? "").trim() !== (b ?? "").trim();
}

/** ============ Props ============ */
type Props = {
  reportId: Guid;
  getAccessToken: () => Promise<string> | string;
  html: string;
  onRemoteHtml?: (html: string) => void;
  hidePresenceBar?: boolean;
  getEditorRoot?: () => HTMLElement | null;
};

export default function ReportCollabClient(props: Props) {
  const { reportId, getAccessToken, html, onRemoteHtml, hidePresenceBar } = props;
  const [collabs, setCollabs] = useState<CollaboratorPresenceDto[]>([]);
  const lastSentHtmlRef = useRef<string>("");

  const {
    connected,
    connecting,
    joined,
    lastError,
    open,
    disconnect,
    leaveReport,
    getActiveCollaborators,
    broadcastChangeDebounced,
  } = useReportCollabHub({
    getAccessToken,
    onSessionJoined: async (p) => {
      setCollabs(p.activeUsers ?? []);
      if (typeof p.currentContent === "string") {
        lastSentHtmlRef.current = p.currentContent;
        onRemoteHtml?.(p.currentContent);
      }
    },
    onUserJoined: async () => {
      const list = await getActiveCollaborators(reportId).catch(() => []);
      setCollabs(list);
    },
    onUserLeft: async () => {
      const list = await getActiveCollaborators(reportId).catch(() => []);
      setCollabs(list);
    },
    onReceiveChange: (change) => {
      if (change.changeType === "content" && typeof change.content === "string") {
        lastSentHtmlRef.current = change.content;
        onRemoteHtml?.(change.content);
      }
    },
    onError: () => {},
    debounceMs: 700,
  });

  /** lifecycle open/join */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await open(reportId);
        if (!mounted) return;
        const list = await getActiveCollaborators(reportId);
        if (!mounted) return;
        setCollabs(list);
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
      (async () => {
        try {
          await leaveReport(reportId);
        } finally {
          await disconnect();
        }
      })();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

  /** Local HTML (TinyMCE) -> broadcast */
  useEffect(() => {
    if (!connected || !joined) return;
    if (!htmlDifferent(html, lastSentHtmlRef.current)) return;

    lastSentHtmlRef.current = html;
    const change: ReportChangeDto = {
      reportId,
      content: html,
      changeType: "content",
    };
    broadcastChangeDebounced(change);
  }, [html, connected, joined, reportId, broadcastChangeDebounced]);

  if (hidePresenceBar) {
    return null;
  }

  return (
    <>
      {/* Live collaboration bar */}
      <div className="mb-2 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
        <div className="flex items-center gap-2 text-slate-700">
          {connected ? (
            <Wifi className="w-4 h-4 text-emerald-600" />
          ) : connecting ? (
            <Activity className="w-4 h-4 animate-pulse text-amber-600" />
          ) : (
            <WifiOff className="w-4 h-4 text-rose-600" />
          )}
          <span className="text-sm">
            {connected
              ? joined
                ? "Live collaboration"
                : "Connected (not joined)"
              : connecting
              ? "Connecting..."
              : "Offline"}
            {lastError ? (
              <span className="ml-2 text-xs text-rose-600">({lastError})</span>
            ) : null}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {collabs.slice(0, 5).map((u) => (
              <div
                key={u.userId}
                className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[11px] font-semibold text-slate-700"
                title={`${u.userName} - ${u.userEmail}`}
              >
                {initials(u.userName)}
              </div>
            ))}
            {collabs.length > 5 && (
              <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[11px] font-semibold text-slate-700">
                +{collabs.length - 5}
              </div>
            )}
          </div>
          <div className="ml-2 flex items-center text-slate-600 text-xs">
            <Users className="w-4 h-4 mr-1" />
            {collabs.length}
          </div>
        </div>
      </div>
    </>
  );
}

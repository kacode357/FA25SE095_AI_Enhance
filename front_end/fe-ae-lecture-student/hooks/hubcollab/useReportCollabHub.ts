// hooks/hubcollab/useReportCollabHub.ts
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";

/** Các kiểu dữ liệu FE (khớp với BE fields) */
export type Guid = string;

export type CollaboratorPresenceDto = {
  userId: string;
  userName: string;
  userEmail: string;
  avatarUrl?: string | null;
  cursorPosition?: number;
  isTyping?: boolean;
  lastActivity?: string;
  connectionId?: string;
};

export type ReportChangeDto = {
  reportId: Guid;
  content: string;
  cursorPosition?: number;
  changeType?: "content" | "cursor" | "typing";

  userId?: string;
  userName?: string;
  userEmail?: string;
  timestamp?: string;
};

export type CursorPositionDto = {
  reportId: Guid;
  position: number;
  userId?: string;
  userName?: string;
  timestamp?: string;
};

export type TextSelectionDto = {
  reportId: Guid;
  selectionStart: number;
  selectionEnd: number;
  selectedText?: string;
  hasSelection?: boolean;
  userId?: string;
  userName?: string;
  timestamp?: string;
};

type SessionJoinedPayload = {
  reportId: Guid;
  activeUsers: CollaboratorPresenceDto[];
  currentContent: string | null;
  version: number;
  message: string;
};

type UserJoinedPayload = {
  userId: string;
  userName: string;
  userEmail: string;
  timestamp: string;
};

type UserLeftPayload = {
  userId: string;
  timestamp: string;
  reason?: "disconnected";
};

type Options = {
  baseUrl?: string;
  getAccessToken: () => Promise<string> | string;

  onSessionJoined?: (p: SessionJoinedPayload) => void;
  onUserJoined?: (p: UserJoinedPayload) => void;
  onUserLeft?: (p: UserLeftPayload) => void;

  onReceiveChange?: (change: ReportChangeDto) => void;
  onCursorMoved?: (cursor: CursorPositionDto) => void;
  onSelectionChanged?: (sel: TextSelectionDto) => void;
  onError?: (message: string) => void;

  debounceMs?: number; // default 200
};

/** ===== Normalizers (RAW -> FE DTO) ===== */
function normChange(raw: any): ReportChangeDto {
  return {
    reportId: raw.reportId ?? raw.ReportId,
    content: raw.content ?? raw.Content ?? "",
    cursorPosition: raw.cursorPosition ?? raw.CursorPosition,
    changeType: raw.changeType ?? raw.ChangeType ?? "content",
    userId: raw.userId ?? raw.UserId,
    userName: raw.userName ?? raw.UserName,
    userEmail: raw.userEmail ?? raw.UserEmail,
    timestamp: raw.timestamp ?? raw.Timestamp,
  };
}
function normCursor(raw: any): CursorPositionDto {
  return {
    reportId: raw.reportId ?? raw.ReportId,
    position: raw.position ?? raw.Position,
    userId: raw.userId ?? raw.UserId,
    userName: raw.userName ?? raw.UserName,
    timestamp: raw.timestamp ?? raw.Timestamp,
  };
}
function normSelection(raw: any): TextSelectionDto {
  return {
    reportId: raw.reportId ?? raw.ReportId,
    selectionStart: raw.selectionStart ?? raw.SelectionStart,
    selectionEnd: raw.selectionEnd ?? raw.SelectionEnd,
    selectedText: raw.selectedText ?? raw.SelectedText,
    hasSelection: raw.hasSelection ?? raw.HasSelection,
    userId: raw.userId ?? raw.UserId,
    userName: raw.userName ?? raw.UserName,
    timestamp: raw.timestamp ?? raw.Timestamp,
  };
}

/** Chuyển đổi (FE DTO -> payload gửi server) */
function mapChangeToServerPayload(c: ReportChangeDto) {
  return {
    reportId: c.reportId, ReportId: c.reportId,
    content: c.content,   Content: c.content,
    cursorPosition: c.cursorPosition, CursorPosition: c.cursorPosition,
    changeType: c.changeType ?? "content", ChangeType: c.changeType ?? "content",
  };
}

const MAX_INLINE_IMG_LENGTH = 26_000;
const INLINE_IMG_PLACEHOLDER =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
const INLINE_IMG_STEPS = [
  { maxWidth: 900, quality: 0.6 },
  { maxWidth: 720, quality: 0.52 },
  { maxWidth: 560, quality: 0.48 },
  { maxWidth: 420, quality: 0.42 },
  { maxWidth: 320, quality: 0.36 },
  { maxWidth: 240, quality: 0.33 },
  { maxWidth: 180, quality: 0.3 },
];

async function downscaleDataUrl(
  dataUrl: string,
  opts?: { maxWidth?: number; quality?: number; format?: "image/webp" | "image/jpeg" }
) {
  if (typeof window === "undefined") return dataUrl;
  const { maxWidth = 900, quality = 0.6, format = "image/webp" } = opts || {};

  return new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const ratio = Math.min(1, maxWidth / (img.width || maxWidth));
        const width = Math.max(1, Math.round(img.width * ratio));
        const height = Math.max(1, Math.round(img.height * ratio));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(dataUrl);
        ctx.drawImage(img, 0, 0, width, height);

        let mime: "image/webp" | "image/jpeg" = format;
        if (mime === "image/webp") {
          try {
            const test = canvas.toDataURL("image/webp");
            if (!test?.startsWith("data:image/webp")) {
              mime = "image/jpeg";
            }
          } catch {
            mime = "image/jpeg";
          }
        }
        const compressed = canvas.toDataURL(mime, quality);
        resolve(compressed || dataUrl);
      } catch (e) {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

async function shrinkDataUrlToLimit(src: string) {
  let current = src;
  for (const step of INLINE_IMG_STEPS) {
    if (current.length <= MAX_INLINE_IMG_LENGTH) break;
    const next = await downscaleDataUrl(current, step);
    if (!next) break;
    if (next.length >= current.length) {
      current = next;
      continue;
    }
    current = next;
  }
  if (current.length > MAX_INLINE_IMG_LENGTH) {
    const emergency = await downscaleDataUrl(current, {
      maxWidth: 140,
      quality: 0.22,
      format: "image/jpeg",
    });
    if (emergency && emergency.length < current.length) {
      current = emergency;
    }
  }
  if (current.length > MAX_INLINE_IMG_LENGTH) {
    current = INLINE_IMG_PLACEHOLDER;
  }
  return current;
}

// Compress inline images to keep SignalR payloads under the hub cap.
async function compressDataUrlsInHtml(html: string) {
  if (!html || typeof window === "undefined") return html;
  if (!html.includes("data:image")) return html;
  if (typeof DOMParser === "undefined") return html;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const images = Array.from(doc.querySelectorAll("img[src^=\"data:image\"]"));
    if (!images.length) return html;

    await Promise.all(
      images.map(async (img) => {
        const src = img.getAttribute("src");
        if (!src) return;
        if (!src.startsWith("data:image")) return;
        // Skip SVG placeholders to avoid canvas/base64 issues with non-Latin chars
        if (src.startsWith("data:image/svg+xml")) return;
        if (src.length <= MAX_INLINE_IMG_LENGTH) return;
        const compressed = await shrinkDataUrlToLimit(src);
        if (compressed && compressed.length < src.length) {
          img.setAttribute("src", compressed);
        }
      })
    );

    return doc.body?.innerHTML ?? html;
  } catch (e) {
    return html;
  }
}

export function useReportCollabHub({
  baseUrl = process.env.NEXT_PUBLIC_COURSE_BASE_URL_HUB ,
  getAccessToken,
  onSessionJoined,
  onUserJoined,
  onUserLeft,
  onReceiveChange,
  onCursorMoved,
  onSelectionChanged,
  onError,
  debounceMs = 200,
}: Options) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [joined, setJoined] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const startInProgressRef = useRef(false);
  const currentReportIdRef = useRef<Guid | null>(null);

  // debounce buffer
  const lastChangeRef = useRef<ReportChangeDto | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ensureConnection = useMemo(() => {
    return () => {
      if (connectionRef.current) return connectionRef.current;

      const conn = new signalR.HubConnectionBuilder()
        .withUrl(`${baseUrl}/hubs/report-collaboration`, {
          accessTokenFactory: async () => {
            try {
              const token = await getAccessToken();
              return typeof token === "string" ? token : "";
            } catch (e) {
              return "";
            }
          },
          transport: signalR.HttpTransportType.WebSockets,
          skipNegotiation: true,
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      /** Các sự kiện từ Server -> Client */
      conn.on("SessionJoined", (p: any) => {
        setJoined(true);
        onSessionJoined?.({
          reportId: p.reportId ?? p.ReportId,
          activeUsers: p.activeUsers ?? p.ActiveUsers ?? [],
          currentContent: p.currentContent ?? p.CurrentContent ?? null,
          version: p.version ?? p.Version ?? 0,
          message: p.message ?? p.Message ?? "",
        });
      });

      conn.on("UserJoined", (p: any) => {
        onUserJoined?.({
          userId: p.userId ?? p.UserId,
          userName: p.userName ?? p.UserName,
          userEmail: p.userEmail ?? p.UserEmail,
          timestamp: p.timestamp ?? p.Timestamp,
        });
      });

      conn.on("UserLeft", (p: any) => {
        onUserLeft?.({
          userId: p.userId ?? p.UserId,
          timestamp: p.timestamp ?? p.Timestamp,
          reason: p.reason,
        });
      });

      conn.on("ReceiveChange", (raw: any) => {
        const change = normChange(raw);
        onReceiveChange?.(change);
      });

      conn.on("CursorMoved", (raw: any) => {
        const c = normCursor(raw);
        onCursorMoved?.(c);
      });

      conn.on("SelectionChanged", (raw: any) => {
        const s = normSelection(raw);
        onSelectionChanged?.(s);
      });

      conn.on("Error", (err: { message?: string } | string) => {
        const msg = typeof err === "string" ? err : err?.message || "Unknown error";
        setLastError(msg);
        setJoined(false);
        onError?.(msg);
      });

      conn.onclose((e) => {
        setConnected(false);
        setJoined(false);
      });
      conn.onreconnecting((e) => {
        setConnected(false);
      });
      conn.onreconnected((id) => {
        setConnected(true);
        const rid = currentReportIdRef.current;
        if (rid) {
          conn.invoke("JoinReport", rid).catch((e) => {});
        }
      });

      connectionRef.current = conn;
      return conn;
    };
  }, [baseUrl, getAccessToken, onSessionJoined, onUserJoined, onUserLeft, onReceiveChange, onCursorMoved, onSelectionChanged, onError]);

  const connect = useCallback(async () => {
    const conn = ensureConnection();
    if (conn.state === signalR.HubConnectionState.Connected) return;
    if (startInProgressRef.current) return;
    try {
      startInProgressRef.current = true;
      setConnecting(true);
      await conn.start();
      setConnected(true);
      setLastError(null);
    } catch (e: any) {
      const msg = e?.message ?? "Failed to connect";
      setConnected(false);
      setLastError(msg);
      onError?.("Failed to connect to report collaboration hub");
      throw e;
    } finally {
      setConnecting(false);
      startInProgressRef.current = false;
    }
  }, [ensureConnection, onError]);

  const joinReport = useCallback(async (reportId: Guid) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) {
      throw new Error("Not connected");
    }
    await conn.invoke("JoinReport", reportId);
    currentReportIdRef.current = reportId;
  }, []);

  const leaveReport = useCallback(async (reportId?: Guid) => {
    const conn = connectionRef.current;
    const rid = reportId ?? currentReportIdRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected || !rid) {
      setJoined(false);
      return;
    }
    await conn.invoke("LeaveReport", rid);
    if (!reportId || reportId === currentReportIdRef.current) currentReportIdRef.current = null;
    setJoined(false);
  }, []);

  const open = useCallback(async (reportId: Guid) => {
    await connect();
    await joinReport(reportId);
  }, [connect, joinReport]);

  const disconnect = useCallback(async () => {
    const conn = connectionRef.current;
    if (conn && conn.state !== signalR.HubConnectionState.Disconnected) {
      await conn.stop();
      setConnected(false);
      setJoined(false);
    }
  }, []);

  const ensureCanSend = () => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) throw new Error("Not connected");
    if (!currentReportIdRef.current) throw new Error("Not joined");
    return conn;
  };

  const broadcastChange = useCallback(async (change: ReportChangeDto) => {
    const conn = ensureCanSend();
    const safeContent = await compressDataUrlsInHtml(change.content || "");
    const payload = mapChangeToServerPayload({ ...change, content: safeContent });
    await conn.invoke("BroadcastChange", payload);
  }, []);

  const broadcastChangeDebounced = useCallback((change: ReportChangeDto) => {
    lastChangeRef.current = change;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      const c = lastChangeRef.current;
      lastChangeRef.current = null;
      if (!c) return;
      try {
        const conn = ensureCanSend();
        const safeContent = await compressDataUrlsInHtml(c.content || "");
        const payload = mapChangeToServerPayload({ ...c, content: safeContent });
        await conn.invoke("BroadcastChange", payload);
      } catch (e) {}
    }, debounceMs);
  }, [debounceMs]);

  const sendCursorPosition = useCallback(async (cursor: CursorPositionDto) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;
    await conn.invoke("SendCursorPosition", {
      reportId: cursor.reportId, ReportId: cursor.reportId,
      position: cursor.position, Position: cursor.position,
    });
  }, []);

  const sendTextSelection = useCallback(async (selection: TextSelectionDto) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;
    await conn.invoke("SendTextSelection", {
      reportId: selection.reportId, ReportId: selection.reportId,
      selectionStart: selection.selectionStart, SelectionStart: selection.selectionStart,
      selectionEnd: selection.selectionEnd,   SelectionEnd: selection.selectionEnd,
      selectedText: selection.selectedText,   SelectedText: selection.selectedText,
      hasSelection: selection.hasSelection,   HasSelection: selection.hasSelection,
    });
  }, []);

  const getActiveCollaborators = useCallback(async (reportId: Guid) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) throw new Error("Not connected");
    const result = await conn.invoke<CollaboratorPresenceDto[]>("GetActiveCollaborators", reportId);
    return result ?? [];
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const conn = connectionRef.current;
      const rid = currentReportIdRef.current;
      if (conn && rid && conn.state === signalR.HubConnectionState.Connected) {
        conn.invoke("LeaveReport", rid).catch(() => {});
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      handleBeforeUnload();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return {
    connected,
    connecting,
    joined,
    lastError,

    open,
    connect,
    disconnect,
    joinReport,
    leaveReport,

    getActiveCollaborators,

    broadcastChange,
    broadcastChangeDebounced,
    sendCursorPosition,
    // typing indicator intentionally removed (as requested)
    sendTextSelection,
  };
}

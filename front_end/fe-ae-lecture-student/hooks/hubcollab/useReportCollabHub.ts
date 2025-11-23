// hooks/hubcollab/useReportCollabHub.ts
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";

/** ===== FE DTOs (match BE fields) ===== */
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
  content: string;          // BE: Content
  cursorPosition?: number;  // BE: CursorPosition
  changeType?: "content" | "cursor" | "typing"; // BE: ChangeType
  // server fill:
  userId?: string;
  userName?: string;
  userEmail?: string;
  timestamp?: string;
};

export type CursorPositionDto = {
  reportId: Guid;
  position: number; // BE: Position
  userId?: string;
  userName?: string;
  timestamp?: string;
};

export type TextSelectionDto = {
  reportId: Guid;
  selectionStart: number; // BE: SelectionStart
  selectionEnd: number;   // BE: SelectionEnd
  selectedText?: string;  // BE: SelectedText
  hasSelection?: boolean; // BE: HasSelection
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

/** ===== Mappers (FE DTO -> payload gửi server) ===== */
function mapChangeToServerPayload(c: ReportChangeDto) {
  return {
    reportId: c.reportId, ReportId: c.reportId,
    content: c.content,   Content: c.content,
    cursorPosition: c.cursorPosition, CursorPosition: c.cursorPosition,
    changeType: c.changeType ?? "content", ChangeType: c.changeType ?? "content",
  };
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

      console.log("[Hub] building connection to", `${baseUrl}/hubs/report-collaboration`);
      const conn = new signalR.HubConnectionBuilder()
        .withUrl(`${baseUrl}/hubs/report-collaboration`, {
          accessTokenFactory: async () => {
            try {
              const token = await getAccessToken();
              console.log("[Hub] accessTokenFactory len:", token?.length ?? 0);
              return typeof token === "string" ? token : "";
            } catch (e) {
              console.warn("[Hub] accessTokenFactory error:", e);
              return "";
            }
          },
          transport: signalR.HttpTransportType.WebSockets,
          skipNegotiation: true,
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      // Server -> Client
      conn.on("SessionJoined", (p: any) => {
        console.log("[Hub] SessionJoined:", p);
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
        console.log("[Hub] UserJoined:", p);
        onUserJoined?.({
          userId: p.userId ?? p.UserId,
          userName: p.userName ?? p.UserName,
          userEmail: p.userEmail ?? p.UserEmail,
          timestamp: p.timestamp ?? p.Timestamp,
        });
      });

      conn.on("UserLeft", (p: any) => {
        console.log("[Hub] UserLeft:", p);
        onUserLeft?.({
          userId: p.userId ?? p.UserId,
          timestamp: p.timestamp ?? p.Timestamp,
          reason: p.reason,
        });
      });

      conn.on("ReceiveChange", (raw: any) => {
        console.log("[Hub] ReceiveChange RAW:", raw);
        const change = normChange(raw);
        console.log("[Hub] ReceiveChange:", change);
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
        console.error("[Hub] Error from server:", msg);
        setLastError(msg);
        setJoined(false);
        onError?.(msg);
      });

      conn.onclose((e) => {
        console.warn("[Hub] onclose:", e);
        setConnected(false);
        setJoined(false);
      });
      conn.onreconnecting((e) => {
        console.warn("[Hub] onreconnecting:", e);
        setConnected(false);
      });
      conn.onreconnected((id) => {
        console.log("[Hub] onreconnected id:", id);
        setConnected(true);
        const rid = currentReportIdRef.current;
        if (rid) {
          console.log("[Hub] re-JoinReport:", rid);
          conn.invoke("JoinReport", rid).catch((e) => {
            console.error("[Hub] rejoin failed:", e?.message ?? e);
          });
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
      console.log("[Hub] starting connection...");
      await conn.start();
      console.log("[Hub] connected with state:", conn.state);
      setConnected(true);
      setLastError(null);
    } catch (e: any) {
      const msg = e?.message ?? "Failed to connect";
      console.error("[Hub] connect error:", msg, e);
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
    console.log("[Hub] joinReport invoking with id:", reportId);
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
    console.log("[Hub] leaveReport invoking with id:", rid);
    await conn.invoke("LeaveReport", rid);
    if (!reportId || reportId === currentReportIdRef.current) currentReportIdRef.current = null;
    setJoined(false);
  }, []);

  const open = useCallback(async (reportId: Guid) => {
    console.log("[Hub] open session for report:", reportId);
    await connect();
    await joinReport(reportId);
  }, [connect, joinReport]);

  const disconnect = useCallback(async () => {
    const conn = connectionRef.current;
    if (conn && conn.state !== signalR.HubConnectionState.Disconnected) {
      console.log("[Hub] disconnecting...");
      await conn.stop();
      console.log("[Hub] disconnected");
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
    const payload = mapChangeToServerPayload(change);
    console.log("[Hub] broadcastChange sending:", payload);
    await conn.invoke("BroadcastChange", payload);
    console.log("[Hub] change sent OK");
  }, []);

  const broadcastChangeDebounced = useCallback((change: ReportChangeDto) => {
    lastChangeRef.current = change;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    console.log("[Hub] schedule debounced change in", debounceMs, "ms");
    debounceTimerRef.current = setTimeout(async () => {
      const c = lastChangeRef.current;
      lastChangeRef.current = null;
      if (!c) return;
      try {
        const conn = ensureCanSend();
        const payload = mapChangeToServerPayload(c);
        console.log("[Hub] debounced change sending:", payload);
        await conn.invoke("BroadcastChange", payload);
        console.log("[Hub] debounced change sent OK");
      } catch (e) {
        console.warn("[Hub] debounced send failed:", e);
      }
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
    console.log("[Hub] getActiveCollaborators for:", reportId);
    const result = await conn.invoke<CollaboratorPresenceDto[]>("GetActiveCollaborators", reportId);
    console.log("[Hub] active collaborators:", result);
    return result ?? [];
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const conn = connectionRef.current;
      const rid = currentReportIdRef.current;
      if (conn && rid && conn.state === signalR.HubConnectionState.Connected) {
        console.log("[Hub] beforeunload → leaveReport:", rid);
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

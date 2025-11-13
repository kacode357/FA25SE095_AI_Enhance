// app/student/courses/[id]/reports/components/ReportCollabClient.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useReportCollabHub } from "@/hooks/hubcollab/useReportCollabHub";
import type {
  Guid,
  ReportChangeDto,
  CollaboratorPresenceDto,
  CursorPositionDto,
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

/** Lấy caret index (tính theo text) trong root (Tiny body) */
function getCaretIndexInRoot(root: HTMLElement): number {
  const doc = root.ownerDocument;
  const sel = doc.getSelection();
  if (!sel || sel.rangeCount === 0) return 0;

  const range = sel.getRangeAt(0).cloneRange();
  const preRange = doc.createRange();
  preRange.selectNodeContents(root);
  try {
    // Kẹp vị trí setEnd để tránh lỗi nếu range.endContainer không nằm trong preRange
    if (preRange.comparePoint(range.endContainer, range.endOffset) < 0) {
      preRange.setEnd(preRange.endContainer, preRange.endOffset);
    } else {
      preRange.setEnd(range.endContainer, range.endOffset);
    }
  } catch {
    return 0;
  }
  return preRange.toString().length;
}

/**
 * Tính rect caret (viewport) từ index trong Tiny body + iframe offset
 * - Khi index nằm trong text → dùng Range.getBoundingClientRect()
 * - Khi editor rỗng → dùng root.getBoundingClientRect() + padding (tránh lệch do margin mặc định của body/iframe)
 */
function caretRectAt(
  root: HTMLElement,
  index: number
): { left: number; top: number; height: number } | null {
  const doc = root.ownerDocument;
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode() as Text | null;
  let remain = index;

  while (current) {
    const len = current.textContent?.length ?? 0;
    if (remain <= len) {
      const range = doc.createRange();
      range.setStart(current, Math.max(0, Math.min(remain, len)));
      range.collapse(true);

      const caretRect = range.getBoundingClientRect();
      const iframeEl = doc.defaultView?.frameElement as HTMLElement | null;

      if (iframeEl) {
        const iframeRect = iframeEl.getBoundingClientRect();
        return {
          left: iframeRect.left + caretRect.left,
          top: iframeRect.top + caretRect.top,
          height: caretRect.height || 16,
        };
      }

      return {
        left: caretRect.left,
        top: caretRect.top,
        height: caretRect.height || 16,
      };
    }

    remain -= len;
    current = walker.nextNode() as Text | null;
  }

  /** ===== Fallback: editor rỗng / không tìm được node text ===== */
  const baseRect = root.getBoundingClientRect();
  const win = doc.defaultView!;
  const cs = win.getComputedStyle(root);

  // Range rỗng không “nhìn thấy” padding, nên ta cộng bù padding thay vì margin
  const padLeft = parseFloat(cs.paddingLeft || "0") || 0;
  const padTop = parseFloat(cs.paddingTop || "0") || 0;

  // Chiều cao fallback: ưu tiên line-height của body, nếu không có thì dùng 16
  let lineHeight = parseFloat(cs.lineHeight || "0");
  if (!lineHeight || Number.isNaN(lineHeight)) lineHeight = 16;

  const iframeEl = win.frameElement as HTMLElement | null;
  if (iframeEl) {
    const iframeRect = iframeEl.getBoundingClientRect();
    return {
      left: iframeRect.left + baseRect.left + padLeft,
      top: iframeRect.top + baseRect.top + padTop,
      height: Math.max(14, Math.floor(lineHeight || 16)),
    };
  }

  return {
    left: baseRect.left + padLeft,
    top: baseRect.top + padTop,
    height: Math.max(14, Math.floor(lineHeight || 16)),
  };
}

/** Định nghĩa props rõ ràng bằng `type` */
type RemoteCaretProps = {
  left: number;
  top: number;
  height: number;
  color: string;
  name: string;
};

/** Remote caret marker (Google Docs style – hover mới hiện tên) */
function RemoteCaret({ left, top, height, color, name }: RemoteCaretProps) {
  return createPortal(
    <div
      className="group pointer-events-auto"
      style={{
        position: "fixed",
        left,
        top,
        zIndex: 60,
      }}
    >
      {/* caret line */}
      <div
        style={{
          width: 2,
          height: Math.max(14, Math.floor(height || 16)),
          background: color,
          borderRadius: 1,
        }}
      />
      {/* dot để dễ hover */}
      <div
        style={{
          width: 6,
          height: 6,
          background: color,
          borderRadius: 9999,
          marginTop: 2,
          marginLeft: -2,
        }}
      />
      {/* tooltip tên khi hover */}
      <div
        className="invisible group-hover:visible transition-opacity duration-100"
        style={{
          position: "absolute",
          left: 10,
          top: -8,
          background: "rgba(255,255,255,0.95)",
          border: "1px solid rgba(226,232,240,1)",
          borderRadius: 6,
          padding: "2px 6px",
          fontSize: 11,
          lineHeight: "14px",
          color,
          whiteSpace: "nowrap",
          boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
        }}
      >
        {name}
      </div>
    </div>,
    document.body
  );
}

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#ef4444",
  "#9333ea",
  "#0ea5e9",
  "#d946ef",
];

/** ============ Props ============ */
type Props = {
  reportId: Guid;
  getAccessToken: () => Promise<string> | string;
  html: string;
  onRemoteHtml?: (html: string) => void;
  hidePresenceBar?: boolean;
  getEditorRoot?: () => HTMLElement | null;
};

export default function ReportCollabClient({
  reportId,
  getAccessToken,
  html,
  onRemoteHtml,
  hidePresenceBar,
  getEditorRoot,
}: Props) {
  const [collabs, setCollabs] = useState<CollaboratorPresenceDto[]>([]);
  const lastSentHtmlRef = useRef<string>("");

  const [remoteCursors, setRemoteCursors] = useState<
    Record<string, { pos: number; name: string; color: string }>
  >({});
  const [cursorCoords, setCursorCoords] = useState<
    Record<string, { left: number; top: number; height: number }>
  >({});

  const recalcTimerRef = useRef<NodeJS.Timeout | null>(null);
  const colorRef = useRef<Record<string, string>>({});

  const colorFor = (userId: string) => {
    if (!colorRef.current[userId]) {
      const idx = Object.keys(colorRef.current).length % COLORS.length;
      colorRef.current[userId] = COLORS[idx];
    }
    return colorRef.current[userId];
  };

  /** Logic "kẹp" (clamp) vị trí con trỏ */
  const recalcAllCursorCoords = useCallback(() => {
    const root = getEditorRoot?.();
    if (!root) return;

    // 1. Lấy độ dài tối đa của DOM hiện tại
    const range = root.ownerDocument.createRange();
    range.selectNodeContents(root);
    const rootLen = range.toString().length;

    const next: Record<string, { left: number; top: number; height: number }> =
      {};
    for (const [uid, info] of Object.entries(remoteCursors)) {
      // 2. "Kẹp" vị trí: Lấy vị trí nhỏ hơn giữa (vị trí remote) và (độ dài DOM)
      const safePos = Math.min(info.pos, rootLen);

      // 3. Tính toán với vị trí đã được "kẹp" an toàn
      const rect = caretRectAt(root, safePos);
      if (!rect) continue;
      next[uid] = rect;
    }
    setCursorCoords(next);
  }, [getEditorRoot, remoteCursors]);

  /** Sử dụng `setTimeout(0)` để chạy vào "next tick" (sau khi state/DOM update) */
  const queueRecalc = useCallback(() => {
    if (typeof window === "undefined") return;

    if (recalcTimerRef.current) {
      clearTimeout(recalcTimerRef.current);
    }

    // Chờ 0ms (next tick)
    recalcTimerRef.current = setTimeout(() => {
      recalcAllCursorCoords();
      recalcTimerRef.current = null;
    }, 0);
  }, [recalcAllCursorCoords]);

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
    sendCursorPosition,
  } = useReportCollabHub({
    getAccessToken,
    onSessionJoined: async (p) => {
      setCollabs(p.activeUsers ?? []);
      if (typeof p.currentContent === "string") {
        lastSentHtmlRef.current = p.currentContent;
        onRemoteHtml?.(p.currentContent);
        queueRecalc(); // OK
      }
    },
    onUserJoined: async () => {
      const list = await getActiveCollaborators(reportId).catch(() => []);
      setCollabs(list);
    },
    onUserLeft: async (u) => {
      const list = await getActiveCollaborators(reportId).catch(() => []);
      setCollabs(list);

      // Xóa caret của user rời đi
      setRemoteCursors((prev) => {
        const n = { ...prev };
        delete n[u.userId];
        return n;
      });
      setCursorCoords((prev) => {
        const n = { ...prev };
        delete n[u.userId];
        return n;
      });
      queueRecalc(); // OK
    },
    onReceiveChange: (change) => {
      if (
        change.changeType === "content" &&
        typeof change.content === "string"
      ) {
        lastSentHtmlRef.current = change.content;
        onRemoteHtml?.(change.content);
        // Bỏ queueRecalc() - `MutationObserver` sẽ lo việc này
      }
    },
    onCursorMoved: (cursor) => {
      if (!cursor?.userId || cursor.position == null) return;
      const uid = cursor.userId;
      setRemoteCursors((prev) => ({
        ...prev,
        [uid]: {
          pos: cursor.position,
          name: cursor.userName ?? "User",
          color: colorFor(uid),
        },
      }));
      // Bỏ queueRecalc() - `MutationObserver` sẽ lo việc này
    },
    onSelectionChanged: () => {},
    onError: () => {},
    debounceMs: 200,
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

  /** Gửi cursorPosition khi selection thay đổi */
  useEffect(() => {
    if (!getEditorRoot) return;
    const root = getEditorRoot();
    if (!root) return;

    const doc = root.ownerDocument;
    const handleSelectionChange = () => {
      if (!connected || !joined) return;
      try {
        const pos = getCaretIndexInRoot(root);
        const payload: CursorPositionDto = { reportId, position: pos };
        sendCursorPosition(payload).catch(() => {});
      } catch {
        // ignore
      }
    };

    doc.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      doc.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [getEditorRoot, connected, joined, reportId, sendCursorPosition]);

  /** Recalc khi scroll / resize (Vẫn cần) */
  useEffect(() => {
    const handler = () => queueRecalc(); // Gọi queueRecalc (đã có delay)

    if (typeof window === "undefined") return;

    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);

    let iframeWin: Window | null = null;
    const root = getEditorRoot?.();
    const doc = root?.ownerDocument;
    if (doc && doc.defaultView && doc.defaultView !== window) {
      iframeWin = doc.defaultView;
      iframeWin.addEventListener("scroll", handler);
    }

    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
      iframeWin?.removeEventListener("scroll", handler);
    };
  }, [getEditorRoot, queueRecalc]);

  /**
   * Recalc khi DOM Tiny body mutate (remote apply, v.v.)
   * Đây là trình xử lý quan trọng nhất
   */
  useEffect(() => {
    const root = getEditorRoot?.();
    if (!root || typeof MutationObserver === "undefined") return;

    const mo = new MutationObserver(() => {
      queueRecalc(); // Gọi queueRecalc (đã có delay)
    });
    mo.observe(root, { childList: true, subtree: true, characterData: true });
    return () => mo.disconnect();
  }, [getEditorRoot, queueRecalc]);

  /** Clear timer khi unmount */
  useEffect(() => {
    const timerRef = recalcTimerRef; // capture ref
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const caretOverlays = Object.entries(cursorCoords).map(([uid, p]) => {
    const info = remoteCursors[uid];
    if (!info) return null;
    return (
      <RemoteCaret
        key={uid}
        left={p.left}
        top={p.top}
        height={p.height}
        color={info.color}
        name={info.name}
      />
    );
  });

  if (hidePresenceBar) {
    return <>{caretOverlays}</>;
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
              ? "Connecting…"
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
                title={`${u.userName} • ${u.userEmail}`}
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

      {/* Remote caret overlays (Google Docs style) */}
      {caretOverlays}
    </>
  );
}

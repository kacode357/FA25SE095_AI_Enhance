// app/student/courses/[id]/reports/components/ReportCollabClient.tsx
"use client";

import { useEffect, useMemo, useRef, useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useReportCollabHub } from "@/hooks/hubcollab/useReportCollabHub";
import type {
  CursorPositionDto,
  Guid,
  ReportChangeDto,
  TextSelectionDto,
  CollaboratorPresenceDto,
} from "@/hooks/hubcollab/useReportCollabHub";
import { Users, Wifi, WifiOff, Activity } from "lucide-react";

/** ===== Utils ===== */
function initials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const one = parts[0]?.[0] ?? "";
  const two = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
  return (one + two).toUpperCase();
}
function getCaretIndex(root: HTMLElement): number {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return 0;
  const range = sel.getRangeAt(0).cloneRange();
  const preRange = document.createRange();
  preRange.selectNodeContents(root);
  preRange.setEnd(range.endContainer, range.endOffset);
  return preRange.toString().length;
}
function setCaretIndex(root: HTMLElement, index: number) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();
  let remain = index;
  while (current) {
    const len = current.textContent?.length ?? 0;
    if (remain <= len) {
      const range = document.createRange();
      const sel = window.getSelection();
      range.setStart(current, Math.max(0, remain));
      range.collapse(true);
      sel?.removeAllRanges();
      sel?.addRange(range);
      return;
    }
    remain -= len;
    current = walker.nextNode();
  }
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(root);
  range.collapse(false);
  sel?.removeAllRanges();
  sel?.addRange(range);
}
function htmlDifferent(a?: string | null, b?: string | null) {
  return (a ?? "").trim() !== (b ?? "").trim();
}

/** Convert text index -> client rect (viewport based) */
function caretRectAt(root: HTMLElement, index: number): DOMRect | null {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode() as Text | null;
  let remain = index;

  while (current) {
    const len = current.textContent?.length ?? 0;
    if (remain <= len) {
      const r = document.createRange();
      r.setStart(current, Math.max(0, Math.min(remain, len)));
      r.collapse(true);
      const rect = r.getBoundingClientRect();
      return rect;
    }
    remain -= len;
    current = walker.nextNode() as Text | null;
  }
  // end of content
  const r = document.createRange();
  r.selectNodeContents(root);
  r.collapse(false);
  return r.getBoundingClientRect();
}

/** ===== Remote caret marker (fixed to viewport) ===== */
function RemoteCaret({
  left,
  top,
  height,
  color,
  name,
}: {
  left: number;
  top: number;
  height: number;
  color: string;
  name: string;
}) {
  // tooltip on hover only
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
      {/* small dot to make target easier for hover */}
      <div
        style={{
          width: 6,
          height: 6,
          background: color,
          borderRadius: 9999,
          marginTop: 2,
          marginLeft: -2, // center dot to line
        }}
      />
      {/* tooltip */}
      <div
        className="invisible group-hover:visible transition-opacity duration-100"
        style={{
          position: "absolute",
          left: 10,
          top: -8,
          background: "rgba(255,255,255,0.95)",
          border: "1px solid rgba(226,232,240,1)", // slate-200
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

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#9333ea", "#0ea5e9", "#d946ef"];

/** ===== Props ===== */
type Props = {
  reportId: Guid;
  getAccessToken: () => Promise<string> | string;
  editorRef: React.RefObject<HTMLDivElement | null>;
  onRemoteHtml?: (html: string) => void;
  hidePresenceBar?: boolean;
};

export default function ReportCollabClient({
  reportId,
  getAccessToken,
  editorRef,
  onRemoteHtml,
  hidePresenceBar,
}: Props) {
  const [collabs, setCollabs] = useState<CollaboratorPresenceDto[]>([]);
  const [editorEl, setEditorEl] = useState<HTMLDivElement | null>(null);

  // remote cursors map: uid -> {pos, name, color}
  const [remoteCursors, setRemoteCursors] = useState<
    Record<string, { pos: number; name: string; color: string }>
  >({});
  // computed viewport coords: uid -> {left, top, height}
  const [cursorCoords, setCursorCoords] = useState<
    Record<string, { left: number; top: number; height: number }>
  >({});

  // chống vòng lặp
  const lastSentHtmlRef = useRef<string>("");
  const applyingRemoteRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  // color per user stable
  const colorRef = useRef<Record<string, string>>({});
  function colorFor(userId: string) {
    if (!colorRef.current[userId]) {
      const idx = Object.keys(colorRef.current).length % COLORS.length;
      colorRef.current[userId] = COLORS[idx];
    }
    return colorRef.current[userId];
  }

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
    sendTextSelection,
  } = useReportCollabHub({
    getAccessToken,
    onSessionJoined: (p) => {
      if (p.currentContent && editorRef.current) {
        const el = editorRef.current;
        if (htmlDifferent(el.innerHTML, p.currentContent)) {
          applyingRemoteRef.current = true;
          el.innerHTML = p.currentContent;
          onRemoteHtml?.(p.currentContent);
          applyingRemoteRef.current = false;
          lastSentHtmlRef.current = p.currentContent;
        }
      }
      setCollabs(p.activeUsers ?? []);
    },
    onUserJoined: async () => {
      try {
        const list = await getActiveCollaborators(reportId);
        setCollabs(list);
      } catch {}
    },
    onUserLeft: async (u) => {
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
      try {
        const list = await getActiveCollaborators(reportId);
        setCollabs(list);
      } catch {}
    },
    onReceiveChange: (change) => {
      // BE: content-based sync
      if (change.changeType === "content" && typeof change.content === "string" && editorRef.current) {
        const el = editorRef.current;
        if (htmlDifferent(el.innerHTML, change.content)) {
          const oldCaret = getCaretIndex(el);
          applyingRemoteRef.current = true;
          el.innerHTML = change.content;
          onRemoteHtml?.(change.content);
          applyingRemoteRef.current = false;
          lastSentHtmlRef.current = change.content;
          try {
            setCaretIndex(el, Math.min(oldCaret, el.innerText.length));
          } catch {}
        }
      }
    },
    onCursorMoved: (cursor) => {
      if (!cursor?.userId) return;
      const uid = cursor.userId;
      setRemoteCursors((prev) => ({
        ...prev,
        [uid]: { pos: cursor.position, name: cursor.userName ?? "User", color: colorFor(uid) },
      }));
      queueRecalc();
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
      } catch {}
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

  /** detect editor node swaps */
  useLayoutEffect(() => {
    const node = editorRef.current ?? null;
    setEditorEl(node);
    const parent = node?.parentElement;
    if (!parent) return;
    const obs = new MutationObserver(() => {
      if (editorRef.current !== node) {
        setEditorEl(editorRef.current ?? null);
      }
    });
    obs.observe(parent, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, [editorRef]);

  /** Local -> Remote listeners (no typing) */
  useEffect(() => {
    const el = editorEl;
    if (!el) return;

    const handleInput = () => {
      if (!connected || !joined) return;
      if (applyingRemoteRef.current) return;
      const html = el.innerHTML;

      if (htmlDifferent(html, lastSentHtmlRef.current)) {
        lastSentHtmlRef.current = html;
        const caret = getCaretIndex(el);
        const change: ReportChangeDto = {
          reportId,
          content: html,
          cursorPosition: caret,
          changeType: "content",
        };
        broadcastChangeDebounced(change);
      }
    };

    const handleSelection = () => {
      if (!connected || !joined) return;
      try {
        const caret = getCaretIndex(el);
        const payload: CursorPositionDto = { reportId, position: caret };
        sendCursorPosition(payload).catch(() => {});
        queueRecalc();
      } catch {}
    };

    el.addEventListener("input", handleInput);
    document.addEventListener("selectionchange", handleSelection);

    return () => {
      el.removeEventListener("input", handleInput);
      document.removeEventListener("selectionchange", handleSelection);
    };
  }, [editorEl, connected, joined, reportId, broadcastChangeDebounced, sendCursorPosition]);

  /** Re-calc viewport coords for all remote cursors with rAF (đỡ giật, fix lệch) */
  const recalcAllCursorCoords = () => {
    const el = editorRef.current;
    if (!el) return;
    const next: Record<string, { left: number; top: number; height: number }> = {};
    for (const [uid, info] of Object.entries(remoteCursors)) {
      const rect = caretRectAt(el, info.pos);
      if (!rect) continue;
      // rect is viewport-based → vị trí fixed theo viewport khớp tuyệt đối
      next[uid] = { left: rect.left, top: rect.top, height: rect.height || 16 };
    }
    setCursorCoords(next);
  };
  const queueRecalc = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      recalcAllCursorCoords();
      rafRef.current = null;
    });
  };

  // recalc khi cursor map đổi
  useEffect(() => {
    queueRecalc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteCursors, editorEl]);

  // recalc on scroll/resize/mutation của editor
  useEffect(() => {
    const handler = () => queueRecalc();
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    const mo = new MutationObserver(handler);
    if (editorRef.current) {
      mo.observe(editorRef.current, { childList: true, characterData: true, subtree: true });
    }
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
      mo.disconnect();
    };
  }, [editorRef]);

  if (hidePresenceBar) {
    // vẫn render caret overlay khi ẩn bar
    return (
      <>
        {Object.entries(cursorCoords).map(([uid, p]) => {
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
        })}
      </>
    );
  }

  return (
    <>
      {/* Live collaboration bar — đặt component này lên trên khung Submit như mày muốn */}
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
            {connected ? (joined ? "Live collaboration" : "Connected (not joined)") : connecting ? "Connecting…" : "Offline"}
            {lastError ? <span className="ml-2 text-xs text-rose-600">({lastError})</span> : null}
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

      {/* Remote caret overlays */}
      {Object.entries(cursorCoords).map(([uid, p]) => {
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
      })}
    </>
  );
}

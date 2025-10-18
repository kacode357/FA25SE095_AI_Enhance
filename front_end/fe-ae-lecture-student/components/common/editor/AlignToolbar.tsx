"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = {
  /** Lấy contentEditable từ parent */
  getEditor: () => HTMLDivElement | null;
  /** Gọi emit HTML ở parent sau khi thao tác */
  onRequestEmit: () => void;
  className?: string;
};

type Align = "left" | "center" | "right";

export default function AlignToolbar({ getEditor, onRequestEmit, className = "" }: Props) {
  const [align, setAlign] = useState<Align>("left");
  const listenerBound = useRef(false);

  // ===== helpers =====
  const getSel = () => (typeof window !== "undefined" ? window.getSelection() : null);

  const getBlockInEditor = () => {
    const editor = getEditor();
    if (!editor) return null;
    const sel = getSel();
    if (!sel || sel.rangeCount === 0) return null;
    let node: Node | null = sel.anchorNode;
    if (!node) return null;
    if (node.nodeType === 3) node = node.parentNode!;
    let el = node as HTMLElement | null;
    while (el && el !== editor) {
      const t = el.tagName;
      if (t === "P" || t === "DIV" || t === "H1" || t === "H2" || t === "H3" || t === "LI" || t === "BLOCKQUOTE") {
        return el;
      }
      el = el.parentElement;
    }
    return editor; // fallback
  };

  const getComputedAlign = (): Align => {
    const el = getBlockInEditor();
    if (!el) return "left";
    const val = (window.getComputedStyle(el).textAlign || "").toLowerCase();
    if (val === "center") return "center";
    if (val === "right") return "right";
    return "left";
  };

  const refreshAlign = () => setAlign(getComputedAlign());

  useEffect(() => {
    if (listenerBound.current) return;
    listenerBound.current = true;

    const editor = getEditor();
    const handle = () => refreshAlign();

    document.addEventListener("selectionchange", handle);
    editor?.addEventListener("keyup", handle);
    editor?.addEventListener("mouseup", handle);
    editor?.addEventListener("input", handle);

    refreshAlign();

    return () => {
      document.removeEventListener("selectionchange", handle);
      editor?.removeEventListener("keyup", handle);
      editor?.removeEventListener("mouseup", handle);
      editor?.removeEventListener("input", handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getEditor]);

  // ===== actions =====
  const applyAlign = (target: Align) => {
    const editor = getEditor();
    if (!editor) return;
    editor.focus();

    // Toggle: nếu đang là target và target != left -> về left
    const finalTarget: Align = align === target && target !== "left" ? "left" : target;

    const cmdMap: Record<Align, string> = {
      left: "justifyLeft",
      center: "justifyCenter",
      right: "justifyRight",
    };
    try {
      document.execCommand(cmdMap[finalTarget], false);
    } catch {
      /* ignore */
    }

    // Fallback set style trực tiếp
    const block = getBlockInEditor();
    if (block) block.style.textAlign = finalTarget === "left" ? "" : finalTarget;

    onRequestEmit();
    setAlign(finalTarget);
  };

  return (
    <div className={className}>
      {/* Segmented control: gọn, không viền đen */}
      <div className="inline-flex overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <SegBtn label="Left"   active={align === "left"}   onClick={() => applyAlign("left")} />
        <Divider />
        <SegBtn label="Center" active={align === "center"} onClick={() => applyAlign("center")} />
        <Divider />
        <SegBtn label="Right"  active={align === "right"}  onClick={() => applyAlign("right")} />
      </div>
    </div>
  );
}

/* ---------- UI bits ---------- */
function SegBtn({
  label,
  onClick,
  active,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  const base = "px-3 py-1.5 text-xs transition-colors focus:outline-none";
  const state = active
    ? "bg-slate-900 text-white"
    : "bg-white text-slate-700 hover:bg-slate-50";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${state}`}
      aria-pressed={!!active}
      title={label}
    >
      {label}
    </button>
  );
}

function Divider() {
  return <span className="h-6 w-px bg-slate-200 self-center" />;
}

"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = {
  getEditor: () => HTMLDivElement | null;
  onRequestEmit: () => void;
  className?: string;
};

export default function LinkToolbar({ getEditor, onRequestEmit, className = "" }: Props) {
  const [url, setUrl]   = useState("");
  const [text, setText] = useState("");
  const [inLink, setInLink] = useState(false);
  const listenerBound = useRef(false);

  const normUrl = (raw: string) => {
    const v = raw.trim();
    if (!v) return "";
    if (/^https?:\/\//i.test(v) || /^mailto:/i.test(v)) return v;
    return `https://${v}`;
  };

  const sel = () => (typeof window !== "undefined" ? window.getSelection() : null);

  const ancestor = (node: Node | null, root: HTMLElement, tag: string) => {
    if (!node) return null;
    let el: HTMLElement | null = node.nodeType === 3 ? (node.parentNode as HTMLElement) : (node as HTMLElement);
    const up = tag.toUpperCase();
    while (el && el !== root) {
      if (el.tagName === up) return el as HTMLElement;
      el = el.parentElement;
    }
    return null;
  };

  const currentLink = (): HTMLAnchorElement | null => {
    const editor = getEditor();
    const s = sel();
    if (!editor || !s || s.rangeCount === 0) return null;
    return ancestor(s.anchorNode, editor, "a") as HTMLAnchorElement | null;
  };

  const normalizeAnchor = (a: HTMLAnchorElement | null) => {
    if (!a) return;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    if (!a.style.textDecoration) a.style.textDecoration = "underline";
  };

  const refresh = () => {
    const a = currentLink();
    setInLink(!!a);
    if (a) {
      const href = a.getAttribute("href") || "";
      if (!url) setUrl(href);
      if (!text) setText(a.textContent || "");
    }
  };

  useEffect(() => {
    if (listenerBound.current) return;
    listenerBound.current = true;

    const editor = getEditor();
    const handle = () => refresh();

    document.addEventListener("selectionchange", handle);
    editor?.addEventListener("keyup", handle);
    editor?.addEventListener("mouseup", handle);
    editor?.addEventListener("input", handle);

    refresh();

    return () => {
      document.removeEventListener("selectionchange", handle);
      editor?.removeEventListener("keyup", handle);
      editor?.removeEventListener("mouseup", handle);
      editor?.removeEventListener("input", handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getEditor]);

  const useSelectionAsText = () => {
    const s = sel();
    if (s && s.rangeCount) {
      const t = s.toString();
      if (t) setText(t);
    }
  };

  const apply = () => {
    const editor = getEditor();
    if (!editor) return;
    editor.focus();

    const finalUrl = normUrl(url);
    if (!finalUrl) return;

    const s = sel();
    if (!s || s.rangeCount === 0) return;
    const range = s.getRangeAt(0);

    if (range.collapsed) {
      const a = document.createElement("a");
      a.href = finalUrl;
      a.textContent = (text || finalUrl).trim();
      normalizeAnchor(a);
      range.insertNode(a);
      range.setStartAfter(a);
      range.collapse(true);
      s.removeAllRanges();
      s.addRange(range);
    } else {
      try {
        document.execCommand("createLink", false, finalUrl);
        normalizeAnchor(currentLink());
      } catch {
        const a = document.createElement("a");
        a.href = finalUrl;
        a.appendChild(range.extractContents());
        normalizeAnchor(a);
        range.insertNode(a);
        range.setStartAfter(a);
        range.collapse(true);
        s.removeAllRanges();
        s.addRange(range);
      }
    }
    onRequestEmit();
    refresh();
  };

  const remove = () => {
    const editor = getEditor();
    if (!editor) return;
    editor.focus();
    try {
      document.execCommand("unlink", false);
    } catch {
      const a = currentLink();
      if (a) a.replaceWith(document.createTextNode(a.textContent || a.href || ""));
    }
    onRequestEmit();
    refresh();
  };

  const open = () => {
    const a = currentLink();
    if (a?.href) window.open(a.href, "_blank", "noopener,noreferrer");
  };

  const hasUrl = url.trim().length > 0;

  return (
    <div className={`rounded-md ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        {/* Chỉ phần Link cần ghi nhãn rõ ràng */}
        <label className="text-[11px] text-slate-600">URL</label>
        <input
          type="text"
          placeholder="https://example.com"
          className="h-8 w-60 rounded border border-slate-200 px-2 text-xs"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          aria-label="Link URL"
        />

        <label className="ml-2 text-[11px] text-slate-600">Text</label>
        <input
          type="text"
          placeholder="(optional)"
          className="h-8 w-48 rounded border border-slate-200 px-2 text-xs"
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="Link text"
        />

        <ToolbarBtn label="Use selected text" onClick={useSelectionAsText} title="Fill Text with current selection" />

        <ToolbarBtn label={inLink ? "Update link" : "Apply link"} onClick={apply} disabled={!hasUrl} />
        <ToolbarBtn label="Remove link" onClick={remove} disabled={!inLink} />
        <ToolbarBtn label="Open" onClick={open} disabled={!inLink} />
      </div>

      {/* Hint nho nhỏ, chỉ cho phần link */}
      <p className="mt-1 text-[11px] text-slate-500">
        Tip: Select text then enter URL → “Apply link”. If nothing selected, “Text” is used as label.
      </p>
    </div>
  );
}

function ToolbarBtn({
  label,
  onClick,
  disabled,
  title,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  const base = "px-2 py-1 text-xs rounded border transition-colors border-slate-200";
  const state = disabled
    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
    : "bg-white text-slate-700 hover:bg-slate-100";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${state}`}
      title={title || label}
      aria-label={label}
    >
      {label}
    </button>
  );
}

// components/common/LiteRichTextEditor.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import TextStyleToolbar from "@/components/common/editor/TextStyleToolbar";
import ListToolbar from "@/components/common/editor/ListToolbar";
import LinkToolbar from "@/components/common/editor/LinkToolbar";
import AlignToolbar from "@/components/common/editor/AlignToolbar";

/** Làm sạch HTML *đưa vào editor* (từ paste/insert) để không đẻ ra markup xấu cho list */
function cleanIncomingHtml(input: string): string {
  if (!input) return "";
  let html = input;

  // Gỡ <p> bao quanh danh sách
  html = html.replace(/<p>\s*(<(?:ol|ul)[\s\S]*?<\/(?:ol|ul)>)\s*<\/p>/gi, "$1");

  // Gỡ <p> bên trong <li>
  html = html.replace(/<li>\s*<p>([\s\S]*?)<\/p>\s*<\/li>/gi, "<li>$1</li>");

  // Nếu toàn bộ bị bọc bởi 1 div duy nhất -> lột ra
  html = html.replace(/^\s*<div[^>]*>([\s\S]*?)<\/div>\s*$/i, "$1");

  return html;
}

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  debounceMs?: number;
};

export default function LiteRichTextEditor({
  value,
  onChange,
  placeholder = "Type here...",
  className = "",
  readOnly = false,
  debounceMs = 120,
}: Props) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const lastHtmlRef = useRef<string>("");

  /* =============== INIT & SYNC =============== */
  useEffect(() => {
    if (!editorRef.current) return;
    if (lastHtmlRef.current === "" && value) {
      editorRef.current.innerHTML = value;
      lastHtmlRef.current = value;
      normalizeLinks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (value !== lastHtmlRef.current) {
      el.innerHTML = value || "";
      lastHtmlRef.current = value || "";
      normalizeLinks();
    }
  }, [value]);

  /* =============== EMIT (debounced) =============== */
  const emit = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      if (html !== lastHtmlRef.current) {
        lastHtmlRef.current = html;
        onChange(html);
      }
      normalizeLinks();
    }, debounceMs) as unknown as number;
  };

  /* =============== INSERT HELPERS =============== */
  const insertHTML = (rawHtml: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();

    const html = cleanIncomingHtml(rawHtml); // 👈 làm sạch trước khi chèn

    // Prefer native
    const supported = document.queryCommandSupported?.("insertHTML");
    if (supported) {
      document.execCommand("insertHTML", false, html);
      return;
    }

    // Fallback: Range API
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const frag = range.createContextualFragment(html);
    range.insertNode(frag);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const insertText = (text: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    try {
      if (document.queryCommandSupported?.("insertText")) {
        document.execCommand("insertText", false, text);
        return;
      }
    } catch {
      /* ignore */
    }
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const insertImage = (src: string, alt?: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();

    const img = document.createElement("img");
    img.src = src;
    if (alt) img.alt = alt;
    // style mặc định cho ảnh
    img.style.maxWidth = "100%";
    img.style.height = "auto";
    img.style.borderRadius = "0.5rem";
    img.style.display = "inline-block";

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      editor.appendChild(img);
      return;
    }
    const range = sel.getRangeAt(0);
    range.insertNode(img);
    range.setStartAfter(img);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  };

  /* =============== PASTE / DROP HANDLERS (keep format + images) =============== */
  const onPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (readOnly) return;

    const cd = e.clipboardData;
    if (!cd) return;

    // 1) Nếu có file ảnh trong clipboard -> chèn ảnh
    if (cd.files && cd.files.length > 0) {
      const imgs = Array.from(cd.files).filter((f) => f.type.startsWith("image/"));
      if (imgs.length > 0) {
        e.preventDefault();
        imgs.forEach((file) => {
          const url = URL.createObjectURL(file);
          insertImage(url, file.name);
          // Revoke sau khi load
          const tempImg = new Image();
          tempImg.onload = () => URL.revokeObjectURL(url);
          tempImg.src = url;
        });
        emit();
        return;
      }
    }

    // 2) Nếu có HTML -> chèn nguyên HTML (đã clean)
    const html = cd.getData("text/html");
    if (html) {
      e.preventDefault();
      insertHTML(html);
      emit();
      return;
    }

    // 3) Fallback: text/plain
    const text = cd.getData("text/plain");
    if (text) {
      e.preventDefault();
      insertText(text);
      emit();
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (readOnly) return;
    // Chỉ xử lý ảnh kéo thả
    const dt = e.dataTransfer;
    if (!dt || !dt.files?.length) return;
    const imgs = Array.from(dt.files).filter((f) => f.type.startsWith("image/"));
    if (imgs.length === 0) return;
    e.preventDefault();
    imgs.forEach((file) => {
      const url = URL.createObjectURL(file);
      insertImage(url, file.name);
      const tempImg = new Image();
      tempImg.onload = () => URL.revokeObjectURL(url);
      tempImg.src = url;
    });
    emit();
  };

  /* =============== LINK NORMALIZATION =============== */
  const normalizeLinks = () => {
    const root = editorRef.current;
    if (!root) return;
    root.querySelectorAll<HTMLAnchorElement>("a").forEach((a) => {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.style.color = "#2563eb";
      a.style.textDecoration = "underline";
    });
  };

  useEffect(() => {
    const root = editorRef.current;
    if (!root) return;
    const click = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const a = t.closest("a") as HTMLAnchorElement | null;
      if (a?.href) {
        e.preventDefault();
        window.open(a.href, "_blank", "noopener,noreferrer");
      }
    };
    root.addEventListener("click", click);
    return () => root.removeEventListener("click", click);
  }, []);

  return (
    <div className={className}>
      {/* ===== Toolbar Dock ===== */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <TextStyleToolbar getEditor={() => editorRef.current} onRequestEmit={emit} className="!bg-transparent !border-0 !p-0" />
          <ListToolbar      getEditor={() => editorRef.current} onRequestEmit={emit} className="!bg-transparent !border-0 !p-0" />
          <LinkToolbar      getEditor={() => editorRef.current} onRequestEmit={emit} className="!bg-transparent !border-0 !p-0" />
          <AlignToolbar     getEditor={() => editorRef.current} onRequestEmit={emit} className="!bg-transparent !border-0 !p-0" />
        </div>
      </div>

      {/* ===== Editor ===== */}
      <div
        ref={editorRef}
        className="rte mt-3 min-h-[260px] rounded-xl border border-slate-200 bg-white p-4 outline-none shadow-sm"
        contentEditable={!readOnly}
        data-placeholder={placeholder}
        onInput={emit}
        onBlur={emit}
        onPaste={onPaste}
        onDrop={onDrop}
        onDragOver={(e) => {
          // Cho phép thả ảnh
          if (!readOnly) e.preventDefault();
        }}
        suppressContentEditableWarning
        style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
      />

      <style jsx>{`
        [contenteditable="true"][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }

        /* Links */
        .rte a { color: #2563eb; text-decoration: underline; }

        /* Headings */
        .rte h1 { font-size: 1.75rem !important; line-height: 2.25rem !important; font-weight: 700 !important; margin: 0.5rem 0 0.25rem !important; }
        .rte h2 { font-size: 1.5rem  !important; line-height: 2rem    !important; font-weight: 700 !important; margin: 0.5rem 0 0.25rem !important; }
        .rte h3 { font-size: 1.25rem !important; line-height: 1.75rem !important; font-weight: 600 !important; margin: 0.4rem 0 0.2rem  !important; }
        .rte p  { margin: 0.2rem 0 !important; }

        /* Quote */
        .rte blockquote {
          border-left: 3px solid #cbd5e1 !important;
          margin: 0.5rem 0 !important;
          padding: 0.35rem 0.75rem !important;
          color: #475569 !important;
          background: #f8fafc !important;
          border-radius: 0.25rem !important;
        }

        /* Lists — show markers clearly */
        .rte ul { list-style-type: disc !important; list-style-position: outside !important; padding-left: 1.5rem !important; }
        .rte ol { list-style-type: decimal !important; list-style-position: outside !important; padding-left: 1.5rem !important; }
        .rte li { display: list-item !important; margin: 0.125rem 0 !important; }
        .rte li::marker { color: #334155 !important; }

        /* Images pasted/dropped */
        .rte img { max-width: 100% !important; height: auto !important; border-radius: 0.5rem; display: inline-block; }

        /* Alignment inheritance */
        .rte h1, .rte h2, .rte h3, .rte p, .rte li, .rte blockquote { text-align: inherit; }
      `}</style>
    </div>
  );
}

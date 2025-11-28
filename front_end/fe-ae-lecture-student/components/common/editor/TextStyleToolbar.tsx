"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = {
  getEditor: () => HTMLDivElement | null;
  onRequestEmit: () => void;
  className?: string;
  defaultFont?: string;
  defaultSize?: "1" | "2" | "3" | "4" | "5" | "6" | "7";
};

type BlockTag = "P" | "H1" | "H2" | "H3" | "BLOCKQUOTE";

export default function TextStyleToolbar({
  getEditor,
  onRequestEmit,
  className = "",
  defaultFont = "",
  defaultSize = "3",
}: Props) {
  // ===== ACTIVE STATES (để highlight nút + toggle lại về mặc định) =====
  const [inlineActive, setInlineActive] = useState({
    bold: false,
    italic: false,
    underline: false,
    strike: false,
  });
  const [blockActive, setBlockActive] = useState<BlockTag>("P");
  const listenerBound = useRef(false);

  // Query inline formats
  const qState = (cmd: string) => {
    try {
      return document.queryCommandState(cmd);
    } catch {
      return false;
    }
  };

  // Detect current block (H1/H2/H3/BLOCKQUOTE/P)
  const getCurrentBlockTag = (): BlockTag => {
    const editor = getEditor();
    if (!editor) return "P";
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return "P";
    let node: Node | null = sel.anchorNode;
    if (!node) return "P";
    if (node.nodeType === 3) node = node.parentNode!;
    let el = node as HTMLElement | null;

    while (el && el !== editor) {
      const t = el.tagName;
      if (t === "H1" || t === "H2" || t === "H3" || t === "BLOCKQUOTE" || t === "P" || t === "DIV" || t === "LI") {
        if (t === "DIV" || t === "LI") return "P"; // normalize
        return t as BlockTag;
      }
      el = el.parentElement;
    }
    return "P";
  };

  const refreshActiveStates = () => {
    // inline
    setInlineActive({
      bold: qState("bold"),
      italic: qState("italic"),
      underline: qState("underline"),
      strike: qState("strikeThrough"),
    });
    // block
    setBlockActive(getCurrentBlockTag());
  };

  // Gắn listener 1 lần để theo caret/selection thay đổi
  useEffect(() => {
    if (listenerBound.current) return;
    listenerBound.current = true;

    const editor = getEditor();
    const handle = () => refreshActiveStates();

    document.addEventListener("selectionchange", handle);
    editor?.addEventListener("keyup", handle);
    editor?.addEventListener("mouseup", handle);
    editor?.addEventListener("input", handle);

    // init
    refreshActiveStates();

    return () => {
      document.removeEventListener("selectionchange", handle);
      editor?.removeEventListener("keyup", handle);
      editor?.removeEventListener("mouseup", handle);
      editor?.removeEventListener("input", handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getEditor]);

  // ===== COMMAND HELPERS =====
  const run = (cmd: string, val?: string) => {
    const editor = getEditor();
    if (!editor) return;
    editor.focus();
    document.execCommand(cmd, false, val);
    onRequestEmit();
    refreshActiveStates();
  };

  const tryFormatBlock = (tag: string) => {
    const tryVals = [tag, `<${tag}>`];
    for (const v of tryVals) {
      try {
        const ok = document.execCommand("formatBlock", false, v);
        if (ok) return true;
      } catch {
        /* ignore */
      }
    }
    return false;
  };

  const mapTagName = (tag: BlockTag) => (tag === "BLOCKQUOTE" ? "blockquote" : tag.toLowerCase());

  const isBlockTag = (el: HTMLElement) => {
    const t = el.tagName;
    return t === "P" || t === "DIV" || t === "H1" || t === "H2" || t === "H3" || t === "BLOCKQUOTE" || t === "LI";
  };

  const getCurrentBlockWithinEditor = (editor: HTMLDivElement, sel: Selection) => {
    let node: Node | null = sel.anchorNode;
    if (!node) return null;
    if (node.nodeType === 3) node = node.parentNode!;
    let el = node as HTMLElement | null;
    while (el && el !== editor) {
      if (isBlockTag(el)) return el;
      el = el.parentElement;
    }
    return null;
  };

  const replaceBlockTag = (el: HTMLElement, newTag: BlockTag) => {
    const tagName = mapTagName(newTag);
    const newEl = document.createElement(tagName);
    for (const { name, value } of Array.from(el.attributes)) {
      newEl.setAttribute(name, value);
    }
    while (el.firstChild) newEl.appendChild(el.firstChild);
    el.replaceWith(newEl);
    return newEl;
  };

  const placeCaretInside = (el: HTMLElement, where: "start" | "end" = "end") => {
    const sel = window.getSelection();
    if (!sel) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(where === "start");
    sel.removeAllRanges();
    sel.addRange(range);
  };

  // ===== TOGGLE BLOCK: H1/H2/H3/QUOTE (click lần 2 trở về P) =====
  const toggleBlock = (toTag: Exclude<BlockTag, "P">) => {
    const editor = getEditor();
    if (!editor) return;
    editor.focus();

    // Nếu đang ở cùng tag -> về P
    const target = blockActive === toTag ? "P" : (toTag as BlockTag);

    // Try native
    if (tryFormatBlock(target)) {
      onRequestEmit();
      refreshActiveStates();
      return;
    }

    // Manual fallback
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const currentBlock = getCurrentBlockWithinEditor(editor, sel);

    if (currentBlock) {
      const newBlock = replaceBlockTag(currentBlock, target);
      placeCaretInside(newBlock, "end");
    } else {
      // No block: wrap selection/caret
      if (range.collapsed) {
        const newBlock = document.createElement(mapTagName(target));
        newBlock.appendChild(document.createTextNode(""));
        range.insertNode(newBlock);
        placeCaretInside(newBlock, "start");
      } else {
        const frag = range.extractContents();
        const newBlock = document.createElement(mapTagName(target));
        newBlock.appendChild(frag);
        range.insertNode(newBlock);
        placeCaretInside(newBlock, "end");
      }
    }

    onRequestEmit();
    refreshActiveStates();
  };

  // ===== Colors =====
  const onPickTextColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    run("foreColor", e.target.value || "inherit");
  };
  const onPickBgColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value || "transparent";
    const cmd = document.queryCommandSupported("hiliteColor") ? "hiliteColor" : "backColor";
    run(cmd, color);
  };

  return (
    <div className={`rounded-t-md border-b bg-slate-50 p-2 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 w-28 text-[11px] font-medium text-slate-600">Text style</span>

        {/* Font */}
        <select
          onChange={(e) => run("fontName", e.target.value || "inherit")}
          className="px-2 py-1 text-xs border rounded"
          defaultValue={defaultFont}
          title="Font family"
        >
          <option value="">Font</option>
          <option value="Arial">Arial</option>
          <option value="Tahoma">Tahoma</option>
          <option value="Verdana">Verdana</option>
          <option value="Times New Roman">Times</option>
          <option value="Courier New">Courier</option>
        </select>

        {/* Size */}
        <select
          onChange={(e) => run("fontSize", e.target.value || "3")}
          className="px-2 py-1 text-xs border rounded"
          defaultValue={defaultSize}
          title="Font size"
        >
          <option value="1">10px</option>
          <option value="2">13px</option>
          <option value="3">16px</option>
          <option value="4">18px</option>
          <option value="5">24px</option>
          <option value="6">32px</option>
          <option value="7">48px</option>
        </select>

        {/* Inline (toggle) */}
        <ToolbarBtn label="Bold" active={inlineActive.bold} onClick={() => run("bold")} />
        <ToolbarBtn label="Italic" active={inlineActive.italic} onClick={() => run("italic")} />
        <ToolbarBtn label="Underline" active={inlineActive.underline} onClick={() => run("underline")} />
        <ToolbarBtn label="Strikethrough" active={inlineActive.strike} onClick={() => run("strikeThrough")} />

        {/* Block (toggle-to-P on second click) */}
        <div className="ml-2 flex items-center gap-1">
          <ToolbarBtn label="H1" active={blockActive === "H1"} onClick={() => toggleBlock("H1")} />
          <ToolbarBtn label="H2" active={blockActive === "H2"} onClick={() => toggleBlock("H2")} />
          <ToolbarBtn label="H3" active={blockActive === "H3"} onClick={() => toggleBlock("H3")} />
          <ToolbarBtn label="Quote" active={blockActive === "BLOCKQUOTE"} onClick={() => toggleBlock("BLOCKQUOTE")} />
        </div>

        {/* Colors */}
        <div className="flex items-center gap-1 ml-2">
          <span className="text-[11px] text-slate-600">Text</span>
          <input type="color" onChange={onPickTextColor} className="h-6 w-8" title="Text color" />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-slate-600">Background</span>
          <input type="color" onChange={onPickBgColor} className="h-6 w-8" title="Background color" />
        </div>
      </div>
    </div>
  );
}

function ToolbarBtn({
  label,
  onClick,
  active,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  const base =
    "px-2 py-1 text-xs rounded border transition-colors border-slate-200";
  const state = active
    ? "bg-slate-900 text-white border-slate-900"
    : "bg-white text-slate-700 hover:bg-slate-100";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${state}`}
      aria-pressed={active ? "true" : "false"}
      title={label}
    >
      {label}
    </button>
  );
}

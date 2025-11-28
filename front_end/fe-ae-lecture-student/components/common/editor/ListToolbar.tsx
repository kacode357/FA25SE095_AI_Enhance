"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** Lấy contentEditable từ parent */
  getEditor: () => HTMLDivElement | null;
  /** Gọi emit HTML ở parent sau khi thao tác */
  onRequestEmit: () => void;
  className?: string;
};

export default function ListToolbar({ getEditor, onRequestEmit, className = "" }: Props) {
  const [active, setActive] = useState({ ordered: false, bullet: false });
  const [canIndent, setCanIndent] = useState(false);   // caret đang ở <li> -> cho phép indent/outdent
  const [canOutdent, setCanOutdent] = useState(false); // ở <li> và có level > 0 -> outdent
  const listenerBound = useRef(false);

  // ===== helpers =====
  const run = (cmd: string) => {
    const editor = getEditor();
    if (!editor) return;
    editor.focus();
    document.execCommand(cmd, false);
    onRequestEmit();
    refreshActive();
  };

  const qState = (cmd: string) => {
    try {
      return document.queryCommandState(cmd);
    } catch {
      return false;
    }
  };

  const getAncestor = (node: Node | null, editor: HTMLElement, tagList: string[]) => {
    if (!node) return null;
    const isText = node.nodeType === 3;
    let el: HTMLElement | null = isText ? (node.parentNode as HTMLElement) : (node as HTMLElement);
    while (el && el !== editor) {
      if (tagList.includes(el.tagName)) return el;
      el = el.parentElement;
    }
    return null;
  };

  const getCurrentLI = (): HTMLLIElement | null => {
    const editor = getEditor();
    if (!editor) return null;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const node = sel.anchorNode;
    return getAncestor(node, editor, ["LI"]) as HTMLLIElement | null;
  };

  const inOrdered = () => {
    const editor = getEditor();
    if (!editor) return false;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return false;
    const node = sel.anchorNode;
    const ol = getAncestor(node, editor, ["OL"]);
    return !!ol;
  };

  const inUnordered = () => {
    const editor = getEditor();
    if (!editor) return false;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return false;
    const node = sel.anchorNode;
    const ul = getAncestor(node, editor, ["UL"]);
    return !!ul;
  };

  const getListDepth = (li: HTMLLIElement | null): number => {
    if (!li) return 0;
    let depth = 0;
    let el: HTMLElement | null = li.parentElement; // UL/OL
    const editor = getEditor();
    while (el && el !== editor) {
      if (el.tagName === "UL" || el.tagName === "OL") depth++;
      el = el.parentElement;
    }
    // depth >=1 vì li.parentElement là UL/OL đầu tiên
    return Math.max(depth - 1, 0);
  };

  const refreshActive = () => {
    // queryCommandState đôi khi không chính xác, nên cộng thêm kiểm ancestor
    const ord = qState("insertOrderedList") || inOrdered();
    const bul = qState("insertUnorderedList") || inUnordered();
    setActive({ ordered: !!ord, bullet: !!bul });

    const li = getCurrentLI();
    const depth = getListDepth(li);
    setCanIndent(!!li);          // có <li> là indent được
    setCanOutdent(!!li && depth > 0); // có level lồng thì outdent được
  };

  useEffect(() => {
    if (listenerBound.current) return;
    listenerBound.current = true;

    const editor = getEditor();
    const handle = () => refreshActive();

    document.addEventListener("selectionchange", handle);
    editor?.addEventListener("keyup", handle);
    editor?.addEventListener("mouseup", handle);
    editor?.addEventListener("input", handle);

    // init
    refreshActive();

    return () => {
      document.removeEventListener("selectionchange", handle);
      editor?.removeEventListener("keyup", handle);
      editor?.removeEventListener("mouseup", handle);
      editor?.removeEventListener("input", handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getEditor]);

  // ===== toggle lists =====
  const toggleOrdered = () => run("insertOrderedList");
  const toggleBullet = () => run("insertUnorderedList");

  // ===== indent / outdent (nested levels) =====
  const doIndent = () => {
    const li = getCurrentLI();
    if (!li) return; // chỉ indent khi đang ở li
    // Native
    document.execCommand("indent", false);
    onRequestEmit();
    refreshActive();
  };

  const doOutdent = () => {
    const li = getCurrentLI();
    if (!li) return; // cần ở li
    // Native
    document.execCommand("outdent", false);
    onRequestEmit();
    refreshActive();
  };

  return (
    <div className={`rounded-t-md border-b bg-slate-50 p-2 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 w-28 text-[11px] font-medium text-slate-600">Lists</span>

        <ToolbarBtn label="Numbered list" active={active.ordered} onClick={toggleOrdered} />
        <ToolbarBtn label="Bulleted list" active={active.bullet} onClick={toggleBullet} />

        <div className="ml-2 flex items-center gap-1">
          <ToolbarBtn label="Indent" onClick={doIndent} disabled={!canIndent} />
          <ToolbarBtn label="Outdent" onClick={doOutdent} disabled={!canOutdent} />
        </div>
      </div>
    </div>
  );
}

function ToolbarBtn({
  label,
  onClick,
  active,
  disabled,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  const base =
    "px-2 py-1 text-xs rounded border transition-colors border-slate-200";
  const state = disabled
    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
    : active
    ? "bg-slate-900 text-white border-slate-900"
    : "bg-white text-slate-700 hover:bg-slate-100";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${state}`}
      aria-pressed={active ? "true" : "false"}
      title={label}
    >
      {label}
    </button>
  );
}

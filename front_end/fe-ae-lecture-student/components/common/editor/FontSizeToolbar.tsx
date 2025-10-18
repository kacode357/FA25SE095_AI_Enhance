"use client";

import React from "react";

type Props = {
  /** Lấy DOM của vùng contentEditable từ parent */
  getEditor: () => HTMLDivElement | null;
  /** Gọi emit của parent sau khi execCommand để cập nhật HTML */
  onRequestEmit: () => void;
  className?: string;
  /** Giá trị mặc định cho font & size (tùy chọn) */
  defaultFont?: string; // ví dụ: "Tahoma"
  defaultSize?: "1" | "2" | "3" | "4" | "5" | "6" | "7"; // execCommand levels
};

export default function FontSizeToolbar({
  getEditor,
  onRequestEmit,
  className = "",
  defaultFont = "",
  defaultSize = "3",
}: Props) {
  const run = (cmd: string, val?: string) => {
    const editor = getEditor();
    if (!editor) return;
    editor.focus();
    document.execCommand(cmd, false, val);
    onRequestEmit();
  };

  return (
    <div className={`rounded-t-md border-b bg-slate-50 p-2 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 w-32 text-[11px] font-medium text-slate-600">Kiểu chữ</span>

        {/* Font */}
        <select
          onChange={(e) => run("fontName", e.target.value || "inherit")}
          className="px-2 py-1 text-xs border rounded"
          defaultValue={defaultFont}
          title="Font"
        >
          <option value="">Font</option>
          <option value="Arial">Arial</option>
          <option value="Tahoma">Tahoma</option>
          <option value="Verdana">Verdana</option>
          <option value="Times New Roman">Times</option>
          <option value="Courier New">Courier</option>
        </select>

        {/* Size (execCommand hỗ trợ 1-7) */}
        <select
          onChange={(e) => run("fontSize", e.target.value || "3")}
          className="px-2 py-1 text-xs border rounded"
          defaultValue={defaultSize}
          title="Size"
        >
          <option value="1">10px</option>
          <option value="2">13px</option>
          <option value="3">16px</option>
          <option value="4">18px</option>
          <option value="5">24px</option>
          <option value="6">32px</option>
          <option value="7">48px</option>
        </select>
      </div>
    </div>
  );
}

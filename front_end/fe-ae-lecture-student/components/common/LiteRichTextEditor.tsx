// components/common/LiteRichTextEditor.tsx
// TinyMCE editor (React wrapper) – safe for read-only & editable
"use client";

import { Editor } from "@tinymce/tinymce-react";
import { useEffect, useRef } from "react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  debounceMs?: number;
  /** optional: lấy Tiny instance (phục vụ live-collab, caret, ...) */
  onInit?: (editor: any) => void;
};

export default function LiteRichTextEditor({
  value,
  onChange,
  placeholder = "Type here...",
  className = "",
  readOnly = false,
  debounceMs = 150,
  onInit,
}: Props) {
  const lastHtmlRef = useRef<string>(value || "");
  const debounceTimer = useRef<number | null>(null);

  const emit = (html: string) => {
    if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    debounceTimer.current = window.setTimeout(() => {
      if (html !== lastHtmlRef.current) {
        lastHtmlRef.current = html;
        onChange(html);
      }
    }, debounceMs) as unknown as number;
  };

  // Sync external value
  useEffect(() => {
    if (value !== lastHtmlRef.current) {
      lastHtmlRef.current = value;
    }
  }, [value]);

  const apiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "no-api-key";
  const cdnBase = `https://cdn.tiny.cloud/1/${apiKey}/tinymce/6`;

  // Khi readOnly: không cần load paste/image/table... để giảm rủi ro load plugin
  const plugins = readOnly
    ? ["autolink", "link", "preview", "code"]
    : ["autolink", "link", "lists", "codesample", "table", "image", "preview", "code", "paste"];

  return (
    <div className={`lite-rte ${className}`}>
      <Editor
        key={readOnly ? "tiny-ro" : "tiny-rw"} // đảm bảo remount khi toggle chế độ
        value={value}
        apiKey={apiKey}
        tinymceScriptSrc={`${cdnBase}/tinymce.min.js`}
        // Tiny hỗ trợ cả disabled và readonly trong init; disabled ở đây là đủ cho UI
        disabled={readOnly}
        onInit={(_evt, editor) => onInit?.(editor)}
        onEditorChange={(content) => emit(content)}
        init={{
          menubar: false,
          height: readOnly ? 360 : 420,
          placeholder,
          base_url: cdnBase, // chỉ 1 key, không dùng baseURL nữa
          plugins,
          toolbar: readOnly
            ? false
            : "undo redo | bold italic underline forecolor backcolor | bullist numlist | " +
              "alignleft aligncenter alignright | link image table | codesample code preview",
          branding: false,
          statusbar: false,
          // Không dùng external_plugins => tránh lỗi Failed to load plugin
          paste_data_images: true,
          skin_url: `${cdnBase}/skins/ui/oxide`,
          convert_urls: false,
          default_link_target: "_blank",
          rel_list: [{ title: "No Referrer", value: "noopener noreferrer" }],
          forced_root_block: "p",
          content_style: `
            body { font-family: Inter, system-ui, sans-serif; font-size:14px; line-height:1.6; }
            h1 { font-size:1.75rem; line-height:2.25rem; font-weight:700; margin:0.5rem 0 0.25rem; }
            h2 { font-size:1.5rem; line-height:2rem; font-weight:700; margin:0.5rem 0 0.25rem; }
            h3 { font-size:1.25rem; line-height:1.75rem; font-weight:600; margin:0.4rem 0 0.2rem; }
            p { margin:0.25rem 0; }
            blockquote { border-left:3px solid #cbd5e1; margin:0.5rem 0; padding:0.35rem 0.75rem; color:#475569; background:#f8fafc; border-radius:0.25rem; }
            a { color:#2563eb; text-decoration:underline; }
            ul,ol { padding-left:1.5rem; }
            li { margin:0.125rem 0; }
            img { max-width:100%; height:auto; border-radius:0.5rem; display:inline-block; }
          `,
          
        }}
      />

      <style jsx global>{`
        .lite-rte .tox:focus-within,
        .lite-rte .tox .tox-editor-container:focus-within,
        .lite-rte .tox .tox-editor-container:focus {
          box-shadow: 0 0 0 1px #cbd5e1 !important;
          outline: none !important;
          border-radius: 0.5rem !important;
        }
        .lite-rte .tox .tox-toolbar__primary:focus-within,
        .lite-rte .tox .tox-toolbar:focus-within {
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );
}

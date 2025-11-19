// components/common/TinyMCE.tsx
"use client";

import { Editor } from "@tinymce/tinymce-react";
import { useEffect, useRef } from "react";

type Props = {
  /** HTML ban đầu khi mount editor (không dùng để control từng keystroke) */
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  debounceMs?: number;
  /** Nhận Tiny editor instance (cho collab/caret) */
  onInit?: (editor: any) => void;
};

function normalize(html: string) {
  return (html ?? "").trim();
}

export default function LiteRichTextEditor({
  value,
  onChange,
  placeholder = "Type here...",
  className = "",
  readOnly = false,
  debounceMs = 150,
  onInit,
}: Props) {
  const editorRef = useRef<any>(null);
  const lastEmittedRef = useRef<string>(normalize(value || ""));
  const initialValueRef = useRef<string>(normalize(value || ""));
  const debounceTimer = useRef<number | null>(null);

  const emit = (html: string) => {
    if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    debounceTimer.current = window.setTimeout(() => {
      const v = normalize(html);
      if (v !== lastEmittedRef.current) {
        lastEmittedRef.current = v;
        onChange(v);
      }
    }, debounceMs) as unknown as number;
  };

  const pushContentFromOutside = (newHtml: string) => {
    const ed = editorRef.current;
    if (!ed) return;

    const v = normalize(newHtml);
    if (v === lastEmittedRef.current) return;

    const cur = normalize(ed.getContent({ format: "raw" }) || "");
    if (v === cur) return;

    ed.setContent(v, { format: "raw" });
    lastEmittedRef.current = v;
  };

  useEffect(() => {
    pushContentFromOutside(value || "");
  }, [value]);

  const apiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "no-api-key";
  const cdnBase = `https://cdn.tiny.cloud/1/${apiKey}/tinymce/6`;
  const tinymceScriptSrc = `${cdnBase}/tinymce.min.js`;

  return (
    <div className={className}>
      <Editor
        initialValue={initialValueRef.current}
        apiKey={apiKey}
        tinymceScriptSrc={tinymceScriptSrc}
        disabled={readOnly}
        onInit={(_evt, editor) => {
          const api: any = editor;
          api.pushContentFromOutside = pushContentFromOutside;
          api.getRoot = () =>
            api.getBody?.() ?? api.getDoc?.()?.body ?? null;

          editorRef.current = api;
          onInit?.(api);
        }}
        onEditorChange={(content) => {
          if (readOnly) return;
          emit(content);
        }}
        init={{
          menubar: false,
          plugins: [
            "autoresize",
            "link",
            "lists",
            "autolink",
            "codesample",
            "table",
            "image",
            "preview",
            "code",
          ],
          toolbar: readOnly
            ? false
            : "undo redo | bold italic underline forecolor backcolor | bullist numlist | alignleft aligncenter alignright | link image table | code preview",
          branding: false,
          statusbar: false,
          placeholder,
          convert_urls: false,
          default_link_target: "_blank",
          rel_list: [{ title: "No Referrer", value: "noopener noreferrer" }],
          forced_root_block: "p",

          // 🔽 chiều cao tối thiểu 400, autoresize sẽ grow thêm theo content
          min_height: 400,
          autoresize_bottom_margin: 0,
          autoresize_overflow_padding: 0,

          skin: "oxide",
          content_css: "default",
          content_style: `
            html, body {
              min-height: 400px;
            }
            body { 
              font-family: Inter, system-ui, sans-serif; 
              font-size:14px; 
              line-height:1.6;
            }
            h1 { font-size:1.75rem; line-height:2.25rem; font-weight:700; margin:0.5rem 0 0.25rem; }
            h2 { font-size:1.5rem; line-height:2rem; font-weight:700; margin:0.5rem 0 0.25rem; }
            h3 { font-size:1.25rem; line-height:1.75rem; font-weight:600; margin:0.4rem 0 0.2rem; }
            p { margin: 0.25rem 0; }
            blockquote { border-left:3px solid #cbd5e1; margin:0.5rem 0; padding:0.35rem 0.75rem; color:#475569; background:#f8fafc; border-radius:0.25rem; }
            a { color:#2563eb; text-decoration:underline; }
            ul,ol { padding-left:1.5rem; }
            li { margin:0.125rem 0; }
            img { max-width:100%; height:auto; border-radius:0.5rem; display:inline-block; }
          `,
        }}
      />
    </div>
  );
}

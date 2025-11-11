// components/common/LiteRichTextEditor.tsx
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
  /** Dùng để nhận Tiny editor instance (phục vụ collab, caret, v.v.) */
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

  // Sync external value changes
  useEffect(() => {
    if (value !== lastHtmlRef.current) {
      lastHtmlRef.current = value;
    }
  }, [value]);

  const apiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "no-api-key";
  const cdnBase = `https://cdn.tiny.cloud/1/${apiKey}/tinymce/6`;

  return (
    <div className={`lite-rte ${className}`}>
      <Editor
        value={value}
        apiKey={apiKey}
        tinymceScriptSrc={`${cdnBase}/tinymce.min.js`}
        disabled={readOnly}
        onInit={(_evt, editor) => {
          onInit?.(editor);
        }}
        onEditorChange={(content) => emit(content)}
        init={{
          menubar: false,
          height: 420,
          placeholder,
          // ✅ CHỈ 1 KEY base_url (không có baseURL để tránh trùng)
          base_url: cdnBase,
          plugins: [
            "link",
            "lists",
            "autolink",
            "codesample",
            "table",
            "image",
            "preview",
            "code",
            "paste",
          ],
          toolbar: readOnly
            ? false
            : "undo redo | bold italic underline forecolor backcolor | bullist numlist | alignleft aligncenter alignright | link image table | code preview",
          branding: false,
          statusbar: false,
          paste_data_images: true,
          external_plugins: {
            paste: `${cdnBase}/plugins/paste/plugin.min.js`,
          },
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
        /* Focus ring tinh tế cho Tiny */
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

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
  /**
   * Khi có HTML mới từ remote/collab, gọi hàm này (truyền qua onInit)
   * để setContent an toàn mà không bị mất caret khi đang gõ.
   */
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
  const debounceTimer = useRef<number | null>(null);

  // Emit change có debounce (ra ngoài)
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

  // Hàm cho parent có thể "đẩy" HTML mới vào editor nhưng KHÔNG đè khi đang gõ
  const pushContentFromOutside = (newHtml: string) => {
    const ed = editorRef.current;
    if (!ed) return;
    const v = normalize(newHtml);
    const cur = normalize(ed.getContent({ format: "raw" }) || "");
    // Nếu editor đang focus (user đang gõ) thì thôi không push để khỏi nhảy caret
    if (ed.hasFocus?.()) return;
    if (v !== cur) {
      ed.setContent(v, { format: "raw" });
      // đồng bộ ref để onChange không bắn lại
      lastEmittedRef.current = v;
    }
  };

  // Lần đầu mount, Tiny sẽ lấy initialValue; KHÔNG truyền props.value để tránh “giật”
  const apiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "no-api-key";
  const cdnBase = `https://cdn.tiny.cloud/1/${apiKey}/tinymce/6`;
  const tinymceScriptSrc = `${cdnBase}/tinymce.min.js`;

  // Khi prop value đổi (ví dụ sau khi fetch xong), nếu editor chưa focus thì push vào
  useEffect(() => {
    pushContentFromOutside(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className={`lite-rte ${className}`}>
      <Editor
        // CHỈ dùng initialValue để tránh controlled wipe
        initialValue={value}
        apiKey={apiKey}
        tinymceScriptSrc={tinymceScriptSrc}
        disabled={readOnly}
        onInit={(_evt, editor) => {
          editorRef.current = editor;
          // expose cho parent nếu cần
          onInit?.({
            ...editor,
            pushContentFromOutside, // parent có thể gọi editor.pushContentFromOutside(html)
          });
        }}
        onEditorChange={(content) => emit(content)}
        init={{
          menubar: false,
          height: 420,
          placeholder,
          plugins: [
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
          convert_urls: false,
          default_link_target: "_blank",
          rel_list: [{ title: "No Referrer", value: "noopener noreferrer" }],
          forced_root_block: "p",
          // Làm “1 khung”: bỏ border nền của Tiny để hòa vào card ngoài
          skin: "oxide",
          content_css: "default",
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
        /* Hoà toolbar + editor vào card ngoài để nhìn như 1 khung */
        .lite-rte .tox .tox-toolbar__primary {
          border: none !important;
          background: transparent !important;
        }
        .lite-rte .tox .tox-editor-header {
          border-bottom: 1px solid #e5e7eb !important; /* mảnh, trùng card */
          background: transparent !important;
        }
        .lite-rte .tox .tox-edit-area__iframe {
          background: #fff !important;
        }
        .lite-rte .tox-tinymce {
          border: none !important;
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );
}

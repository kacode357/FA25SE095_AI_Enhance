// components/common/TinyMCE.tsx
"use client";

import { Editor } from "@tinymce/tinymce-react";
import { useRef } from "react"; // Bỏ useEffect

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

  // Giá trị cuối cùng MÀ editor tự emit ra ngoài (local typing)
  const lastEmittedRef = useRef<string>(normalize(value || ""));
  const debounceTimer = useRef<number | null>(null);

  // Emit change có debounce (ra ngoài)
  const emit = (html: string) => {
    if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    debounceTimer.current = window.setTimeout(() => {
      const v = normalize(html);
      if (v !== lastEmittedRef.current) {
        lastEmittedRef.current = v; // đánh dấu value này là do editor emit
        onChange(v);
      }
    }, debounceMs) as unknown as number;
  };

  // Hàm cho parent/collab có thể "đẩy" HTML mới vào editor (remote/initial)
  const pushContentFromOutside = (newHtml: string) => {
    const ed = editorRef.current;
    if (!ed) return;

    const v = normalize(newHtml);

    // FIX: Nếu giá trị mới giống hệt giá trị cuối cùng
    // mà editor này TỰ EMIT ra, thì đây là 1 vòng lặp. Bỏ qua.
    if (v === lastEmittedRef.current) {
      return;
    }

    const cur = normalize(ed.getContent({ format: "raw" }) || "");

    // Nếu giống nhau thì thôi
    if (v === cur) return;

    // BỎ check `hasFocus` vì nó không đáng tin cậy
    // if (ed.hasFocus?.()) return;

    // Remote update / initial load → setContent
    ed.setContent(v, { format: "raw" });

    // Đồng bộ ref để onEditorChange không re-emit vòng lặp
    lastEmittedRef.current = v;
  };

  // Lần đầu mount, Tiny sẽ lấy initialValue; KHÔNG truyền props.value để tránh “giật”
  const apiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "no-api-key";
  const cdnBase = `https://cdn.tiny.cloud/1/${apiKey}/tinymce/6`;
  const tinymceScriptSrc = `${cdnBase}/tinymce.min.js`;

  /**
   * ĐÃ XÓA BỎ useEffect theo dõi [value]
   */

  return (
    <div className={`lite-rte ${className}`}>
      <Editor
        // CHỈ dùng initialValue để tránh controlled wipe
        initialValue={value}
        apiKey={apiKey}
        tinymceScriptSrc={tinymceScriptSrc}
        disabled={readOnly}
        onInit={(_evt, editor) => {
          const api: any = editor;

          // helper cho parent/collab
          api.pushContentFromOutside = pushContentFromOutside;
          api.getRoot = () =>
            api.getBody?.() ??
            api.getDoc?.()?.body ??
            null;

          editorRef.current = api;

          // expose cho parent
          onInit?.(api);
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
            /* ✅ FIX 1: BỎ padding. Để cho 'page.tsx' lo việc này */
            body { 
              font-family: Inter, system-ui, sans-serif; 
              font-size:14px; 
              line-height:1.6;
              /* padding: 0.75rem 1rem; */ /* <--- ĐÃ XÓA DÒNG NÀY */
            }
            h1 { font-size:1.75rem; line-height:2.25rem; font-weight:700; margin:0.5rem 0 0.25rem; }
            h2 { font-size:1.5rem; line-height:2rem; font-weight:700; margin:0.5rem 0 0.25rem; }
            h3 { font-size:1.25rem; line-height:1.75rem; font-weight:600; margin:0.4rem 0 0.2rem; }
            /* ✅ FIX 2: Trả lại margin cho p (vì body không còn padding) */
            p { margin: 0.25rem 0; }
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
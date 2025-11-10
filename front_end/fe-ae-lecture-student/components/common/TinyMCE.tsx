// TinyMCE editor using official React wrapper
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
};

export default function LiteRichTextEditor({
  value,
  onChange,
  placeholder = "Type description...",
  className = "",
  readOnly = false,
  debounceMs = 150,
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

  // Sync external updates (e.g., form reset). The Editor component will handle value prop;
  useEffect(() => {
    if (value !== lastHtmlRef.current) {
      lastHtmlRef.current = value;
    }
  }, [value]);

  return (
    <div className={`lite-rte ${className}`}> 
      <Editor
        value={value}
        apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
        tinymceScriptSrc={`https://cdn.tiny.cloud/1/${process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "no-api-key"}/tinymce/6/tinymce.min.js`}
        disabled={readOnly}
        onEditorChange={(content) => emit(content)}
        init={{
          menubar: false,
          height: 300,
          placeholder,
          /* Ensure TinyMCE knows where to load plugins/skins from when using CDN */
          base_url: `https://cdn.tiny.cloud/1/${process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "no-api-key"}/tinymce/6`,
          baseURL: `https://cdn.tiny.cloud/1/${process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "no-api-key"}/tinymce/6`,
          plugins: [
            "link",
            "lists",
            "autolink",
            "codesample",
            "table",
            "image",
            "preview",
            "code",
            "paste"
          ],
          toolbar:
            "undo redo | bold italic underline forecolor backcolor | bullist numlist | alignleft aligncenter alignright | link image table | code preview",
          branding: false,
          statusbar: false,
          paste_data_images: true,
          /* explicitly point paste plugin (fixes some loader issues under turboweb/turbopack) */
          external_plugins: {
            paste: `https://cdn.tiny.cloud/1/${process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "no-api-key"}/tinymce/6/plugins/paste/plugin.min.js`,
          },
          skin_url: `https://cdn.tiny.cloud/1/${process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "no-api-key"}/tinymce/6/skins/ui/oxide`,
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
        /* Replace TinyMCE blue focus with slate tone for our editor instance */
        .lite-rte .tox:focus-within,
        .lite-rte .tox .tox-editor-container:focus-within,
        .lite-rte .tox .tox-editor-container:focus {
          box-shadow: 0 0 0 1px #cbd5e1 !important; /* slate-300 */
          outline: none !important;
          border-radius: 0.5rem !important;
        }

        /* remove default blue ring on toolbar focus */
        .lite-rte .tox .tox-toolbar__primary:focus-within,
        .lite-rte .tox .tox-toolbar:focus-within {
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );
}

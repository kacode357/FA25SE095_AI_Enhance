// components/common/TinyMCE.tsx
"use client";

import { Editor } from "@tinymce/tinymce-react";
import { useEffect, useRef } from "react";
type BlobInfo = {
  blob: () => Blob;
  base64: () => string;
  filename: () => string;
};

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  debounceMs?: number;
  /** Nhận Tiny editor instance (cho collab/caret) */
  onInit?: (editor: any) => void;
  onUploadImage?: (file: File) => Promise<string>;
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
  onUploadImage,
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
        initialValue={value || ""}
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
          // Ensure the current prop value is reflected even if it arrived after mount
          try {
            const currentValue = value || "";
            if (currentValue) {
              pushContentFromOutside(currentValue);
            }
          } catch (e) {
            console.warn("TinyMCE init content push failed", e);
          }
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
          automatic_uploads: false,
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
          extended_valid_elements: "img[src|alt|width|height]",
          images_file_types: "jpeg,jpg,jpe,jfi,jif,jfif,png,gif,webp,bmp,ico",

          paste_data_images: true,
          // Chỉ mở file picker cho ảnh
          file_picker_types: "image",

          // Callback mở dialog chọn ảnh (hoặc từ camera nếu thiết bị hỗ trợ)
          file_picker_callback: async (
            callback: (url: string, meta?: { alt?: string }) => void,
            _value: string,
            _meta: unknown
          ): Promise<void> => {
            if (readOnly) return;
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = async () => {
              const file = input.files?.[0];
              if (!file) return;
              try {
                if (onUploadImage) {
                  try {
                    const url = await onUploadImage(file);
                    if (url) {
                      callback(url, { alt: file.name });
                      return;
                    }
                    console.warn("Upload returned empty URL, falling back to data URL.");
                  } catch (e) {
                    console.warn("Upload failed, falling back to data URL.", e);
                  }
                  // Fallback to data URL if upload failed or returned empty
                  const reader = new FileReader();
                  reader.onload = () => {
                    const result = String(reader.result || "");
                    const isDataUrl = result.startsWith("data:");
                    const mime = file.type || "image/png";
                    const url = isDataUrl ? result : `data:${mime};base64,${result}`;
                    if (!url || url.endsWith(",")) {
                      console.warn("Empty image data, ignoring.");
                      return;
                    }
                    callback(url, { alt: file.name });
                  };
                  reader.onerror = () => {
                    console.error("FileReader failed to read image");
                  };
                  reader.readAsDataURL(file);
                } else {
                  // Fallback: inline base64 nếu không có hàm upload
                  const reader = new FileReader();
                  reader.onload = () => {
                    const result = String(reader.result || "");
                    // Ensure it is a proper data URL so TinyMCE renders it
                    const isDataUrl = result.startsWith("data:");
                    const mime = file.type || "image/png";
                    const url = isDataUrl ? result : `data:${mime};base64,${result}`;
                    if (!url || url.endsWith(",")) {
                      console.warn("Empty image data, ignoring.");
                      return;
                    }
                    callback(url, { alt: file.name });
                  };
                  reader.onerror = () => {
                    console.error("FileReader failed to read image");
                  };
                  reader.readAsDataURL(file);
                }
              } catch (err) {
                console.error("Upload image failed", err);
              }
            };
            input.click();
          },

          // Xử lý upload ảnh khi dán/drag-drop
          images_upload_handler: async (
            blobInfo: BlobInfo,
            _progress: (percent: number) => void
          ): Promise<string> => {
            if (readOnly) throw new Error("Editor is read-only");
            const blob = blobInfo.blob();
            const file = new File([blob], blobInfo.filename() || "image.png", {
              type: blob.type || "image/png",
            });
            if (onUploadImage) {
              try {
                const url = await onUploadImage(file);
                if (url) return url; // TinyMCE sẽ chèn URL này vào nội dung
                console.warn("Upload returned empty URL; using data URL fallback.");
              } catch (e) {
                console.warn("Upload failed; using data URL fallback.", e);
              }
            }
            // Fallback: trả về đầy đủ data URL để trình duyệt hiển thị đúng
            const mime = blob.type || "image/png";
            const base64 = blobInfo.base64();
            if (!base64) throw new Error("Empty image data");
            return `data:${mime};base64,${base64}`;
          },

          // 🔽 chiều cao tối thiểu 400, autoresize sẽ grow thêm theo content
          min_height: 300,
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
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

// Compress / resize an image blob or file to a target max width and max bytes.
async function compressImageFile(
  input: Blob | File,
  opts?: { maxWidth?: number; maxBytes?: number; mime?: string }
): Promise<Blob> {
  const { maxWidth = 1200, maxBytes = 500 * 1024, mime = "image/jpeg" } =
    opts || {};

  // Read blob as data URL
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result || ""));
    fr.onerror = (e) => reject(e);
    fr.readAsDataURL(input);
  });

  // Create image
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = (e) => reject(e);
    i.src = dataUrl;
  });

  const srcWidth = img.naturalWidth || img.width;
  const srcHeight = img.naturalHeight || img.height;
  if (!srcWidth || !srcHeight) return input;

  // Compute target dimensions preserving aspect ratio
  let targetWidth = srcWidth;
  let targetHeight = srcHeight;
  if (srcWidth > maxWidth) {
    targetWidth = maxWidth;
    targetHeight = Math.round((srcHeight * maxWidth) / srcWidth);
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return input;
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // Try decreasing quality until under maxBytes or quality floor
  let quality = 0.85;
  const minQuality = 0.45;
  // Helper to export to blob
  const exportBlob = (q: number) =>
    new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), mime, q)
    );

  let out: Blob | null = await exportBlob(quality);
  // If original fit already and smaller, prefer that
  try {
    const originalSize = input.size;
    if (originalSize > 0 && out && out.size > originalSize) {
      // If compressed blob larger than original, return original
      return input;
    }
  } catch (e) {
    // ignore
  }

  while (out && out.size > maxBytes && quality > minQuality) {
    quality -= 0.1;
    out = await exportBlob(Math.max(quality, minQuality));
  }

  // If compression failed, fallback to original input
  if (!out) return input;
  return out;
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
                // Compress / resize before upload/insert
                let compressed: Blob = file;
                try {
                  compressed = await compressImageFile(file, {
                    maxWidth: 1200,
                    maxBytes: 500 * 1024,
                    mime: "image/jpeg",
                  });
                } catch (e) {
                  console.warn("Image compression failed, using original file.", e);
                }

                const compressedFile = new File([compressed], file.name, {
                  type: compressed.type || file.type || "image/png",
                });

                if (onUploadImage) {
                  try {
                    const url = await onUploadImage(compressedFile);
                    if (url) {
                      callback(url, { alt: file.name });
                      return;
                    }
                    console.warn("Upload returned empty URL, falling back to data URL.");
                  } catch (e) {
                    console.warn("Upload failed, falling back to data URL.", e);
                  }
                }

                // Fallback: insert inline data URL from compressed blob
                const reader = new FileReader();
                reader.onload = () => {
                  const result = String(reader.result || "");
                  const isDataUrl = result.startsWith("data:");
                  const mime = compressed.type || file.type || "image/png";
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
                reader.readAsDataURL(compressed);
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
            try {
              const compressed = await compressImageFile(blob, {
                maxWidth: 1200,
                maxBytes: 500 * 1024,
                mime: "image/jpeg",
              });

              const file = new File([
                compressed,
              ], blobInfo.filename() || "image.png", {
                type: compressed.type || blob.type || "image/png",
              });

              if (onUploadImage) {
                try {
                  const url = await onUploadImage(file);
                  if (url) return url; // TinyMCE will insert this URL
                  console.warn("Upload returned empty URL; using data URL fallback.");
                } catch (e) {
                  console.warn("Upload failed; using data URL fallback.", e);
                }
              }

              // Fallback: return data URL from compressed blob
              const base64 = await new Promise<string>((resolve, reject) => {
                const fr = new FileReader();
                fr.onload = () => resolve(String(fr.result || ""));
                fr.onerror = (e) => reject(e);
                fr.readAsDataURL(compressed);
              });
              return base64;
            } catch (e) {
              console.warn("Image compression/upload fallback path hit.", e);
              const mime = blob.type || "image/png";
              const base64 = blobInfo.base64();
              if (!base64) throw new Error("Empty image data");
              return `data:${mime};base64,${base64}`;
            }
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
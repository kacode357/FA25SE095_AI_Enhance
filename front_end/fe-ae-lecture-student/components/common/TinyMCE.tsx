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

/** ===============================
 *  ADD: Resize + Compress Image (FE only)
 *  =============================== */
function resizeAndCompressImage(
  file: Blob,
  options?: {
    maxWidth?: number;
    quality?: number;
    mimeType?: "image/jpeg" | "image/webp";
  }
): Promise<string> {
  const { maxWidth = 1200, quality = 0.7, mimeType = "image/jpeg" } =
    options || {};

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.src = reader.result as string;
    };

    reader.onerror = reject;
    img.onerror = reject;

    img.onload = () => {
      let { width, height } = img;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return reject();

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject();
          const fr = new FileReader();
          fr.onload = () => resolve(fr.result as string);
          fr.readAsDataURL(blob);
        },
        mimeType,
        quality
      );
    };

    reader.readAsDataURL(file);
  });
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

          /** ===============================
           *  ADD: Enable paste image
           *  =============================== */
          paste_data_images: true,
          file_picker_types: "image",

          file_picker_callback: async (
            callback: (url: string, meta?: { alt?: string }) => void
          ) => {
            if (readOnly) return;
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = async () => {
              const file = input.files?.[0];
              if (!file) return;
              try {
                if (onUploadImage) {
                  const url = await onUploadImage(file);
                  callback(url, { alt: file.name });
                } else {
                  const compressed = await resizeAndCompressImage(file);
                  callback(compressed, { alt: file.name });
                }
              } catch (err) {
                console.error("Pick image failed", err);
              }
            };
            input.click();
          },

          images_upload_handler: async (blobInfo: BlobInfo): Promise<string> => {
            if (readOnly) {
              // In read-only mode, still return a valid data URL so images render
              const type = blobInfo.blob().type || "image/png";
              const base64 = blobInfo.base64();
              return Promise.resolve(`data:${type};base64,${base64}`);
            }

            const blob = blobInfo.blob();
            const file = new File([blob], blobInfo.filename() || "image.png", {
              type: blob.type || "image/png",
            });

            if (onUploadImage) {
              return await onUploadImage(file);
            }

            return await resizeAndCompressImage(blob);
          },

          /** ===============================
           *  ADD: Paste image → compress → insert
           *  =============================== */
          setup: (editor: any) => {
            editor.on("init", () => {
              const body = editor.getBody();
              if (!body) return;

              body.addEventListener("paste", (e: ClipboardEvent) => {
                if (editor.mode.get() === "readonly") {
                  return;
                }

                const clipboardData = e.clipboardData;
                if (!clipboardData) return;

                const items = clipboardData.items;
                if (!items) return;

                for (const item of items) {
                  if (item.type.startsWith("image/")) {
                    e.preventDefault();

                    const file = item.getAsFile();
                    if (!file) return;

                    setTimeout(async () => {
                      const compressedBase64 = await resizeAndCompressImage(file, {
                        maxWidth: 1200,
                        quality: 0.7,
                        mimeType: "image/jpeg",
                      });

                      editor.insertContent(`<img src="${compressedBase64}" />`);
                    }, 0);
                  }
                }
              });

            });
          },


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

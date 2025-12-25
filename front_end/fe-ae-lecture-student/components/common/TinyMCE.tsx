"use client";

import { Editor } from "@tinymce/tinymce-react";
import { useEffect, useMemo, useRef } from "react";

type BlobInfo = {
  blob: () => Blob;
  base64: () => string;
  filename: () => string;
};

type FilePickerMeta = {
  filetype?: string;
  fieldname?: string;
};

type FilePickerCallback = (url: string, meta?: { alt?: string }) => void;

type UploadImageMeta = {
  source?: "picker" | "paste";
  dataUrl?: string;
};

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  debounceMs?: number;
  onInit?: (editor: any) => void;
  onUploadImage?: (file: File, meta?: UploadImageMeta) => Promise<string>;
};

const normalize = (html: string) => (html ?? "").trim();

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
    reader.onerror = () => reject(new Error("Failed to read image"));
    img.onerror = () => reject(new Error("Failed to load image"));

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
      if (!ctx) return reject(new Error("Canvas not available"));

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Failed to create blob"));
          const fr = new FileReader();
          fr.onload = () => resolve(fr.result as string);
          fr.onerror = () => reject(new Error("Failed to read blob"));
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
  const initialValue = useMemo(() => normalize(value || ""), []);
  const debounceTimer = useRef<number | null>(null);
  const uploadTaskRef = useRef<Map<string, Promise<string>>>(new Map());

  const apiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "no-api-key";
  const cdnBase = `https://cdn.tiny.cloud/1/${apiKey}/tinymce/6`;
  const tinymceScriptSrc = `${cdnBase}/tinymce.min.js`;

  useEffect(() => {
    const ed = editorRef.current;
    if (!ed) return;

    const next = normalize(value || "");
    if (next === lastEmittedRef.current) return;

    const cur = normalize(ed.getContent({ format: "raw" }) || "");
    if (cur === next) {
      lastEmittedRef.current = next;
      return;
    }

    ed.setContent(next, { format: "raw" });
    lastEmittedRef.current = next;
  }, [value]);

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

  const allowNativePasteImages = Boolean(onUploadImage);

  return (
    <div className={className}>
      <Editor
        initialValue={initialValue}
        apiKey={apiKey}
        tinymceScriptSrc={tinymceScriptSrc}
        disabled={readOnly}
        onInit={(_evt, editor) => {
          const api: any = editor;

          api.getRoot = () => api.getBody?.() ?? api.getDoc?.()?.body ?? null;
          api.pushContentFromOutside = (
            html: string,
            opts?: { preserveSelection?: boolean }
          ) => {
            const v = normalize(html || "");
            if (opts?.preserveSelection && api.hasFocus?.() && api.selection?.getBookmark) {
              const bookmark = api.selection.getBookmark(2, true);
              api.setContent(v, { format: "raw" });
              if (bookmark) {
                try {
                  api.selection.moveToBookmark(bookmark);
                } catch {
                  // ignore invalid bookmark after external content changes
                }
              }
            } else {
              api.setContent(v, { format: "raw" });
            }
            lastEmittedRef.current = v;
          };
          api.syncExternalContent = (html: string) => {
            lastEmittedRef.current = normalize(html || "");
          };

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

          paste_data_images: allowNativePasteImages,
          file_picker_types: "image",

          // ✅ FIX TS7006: typed callback + meta
          file_picker_callback: (
            callback: FilePickerCallback,
            _value: string,
            _meta: FilePickerMeta
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
                  const url = await onUploadImage(file, { source: "picker" });
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
              const type = blobInfo.blob().type || "image/png";
              return `data:${type};base64,${blobInfo.base64()}`;
            }

            const blob = blobInfo.blob();
            const file = new File([blob], blobInfo.filename() || "image.png", {
              type: blob.type || "image/png",
            });

            if (onUploadImage) {
              const type = blob.type || "image/png";
              const dataUrl = `data:${type};base64,${blobInfo.base64()}`;
              const cacheKey = dataUrl;
              const existing = uploadTaskRef.current.get(cacheKey);
              if (existing) return await existing;
              const task = onUploadImage(file, { source: "paste", dataUrl }).finally(() => {
                uploadTaskRef.current.delete(cacheKey);
              });
              uploadTaskRef.current.set(cacheKey, task);
              return await task;
            }

            return await resizeAndCompressImage(blob);
          },

          min_height: 300,
          autoresize_bottom_margin: 0,
          autoresize_overflow_padding: 0,

          skin: "oxide",
          content_css: "default",
          content_style: `
            html, body { min-height: 400px; }
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

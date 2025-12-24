// app/student/courses/[id]/reports/components/ReportSubmissionEditor.tsx
"use client";

import { Info } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import LiteRichTextEditor from "@/components/common/TinyMCE";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReportStatus } from "@/config/classroom-service/report-status.enum";
import { useImageUpload } from "@/hooks/image-upload/useImageUpload";
import { useUpdateReport } from "@/hooks/reports/useUpdateReport";
import type { UpdateReportPayload } from "@/types/reports/reports.payload";
import type { ReportDetail } from "@/types/reports/reports.response";
import ReportCollabClient from "./ReportCollabClient";

type Props = {
  report: ReportDetail;
  html: string;
  onChange: (value: string) => void;
  getAccessToken: () => Promise<string> | string;
};

const buildSavedKey = (reportId: string) => `report:${reportId}:saved-once`;
const DATA_IMAGE_REGEX = /<img[^>]+src=["'](data:image\/[^"']+)["'][^>]*>/gi;
const ALLOWED_EXTS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

function isAllowedImage(file: File) {
  const ext = (file.name || "")
    .toLowerCase()
    .trim()
    .match(/\.[^.]+$/)?.[0];
  const mime = (file.type || "").toLowerCase();
  const byExt = ext ? ALLOWED_EXTS.includes(ext) : false;
  const byMime =
    mime === "image/jpeg" ||
    mime === "image/jpg" ||
    mime === "image/png" ||
    mime === "image/gif" ||
    mime === "image/webp";
  return byExt || byMime;
}

function hasDataImages(html?: string | null) {
  if (!html) return false;
  return /<img[^>]+src=["']data:image\//i.test(html);
}

function extractDataImageSrcs(html?: string | null): string[] {
  if (!html) return [];
  const regex = new RegExp(DATA_IMAGE_REGEX);
  const results: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    if (match[1]) results.push(match[1]);
  }
  return Array.from(new Set(results));
}

function replaceImageSrc(html: string, from: string, to: string) {
  if (!from) return html;
  return html.split(from).join(to);
}

function dataUrlToFile(dataUrl: string, filename: string): File | null {
  try {
    const arr = dataUrl.split(",");
    if (arr.length < 2) return null;
    const mimeMatch = arr[0]?.match(/data:(.*?);/);
    const mime = mimeMatch?.[1] || "image/jpeg";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  } catch {
    return null;
  }
}

async function fileToCompressedDataUrl(
  file: File,
  opts: { maxWidth?: number; quality?: number; mimeType?: "image/jpeg" | "image/webp" } = {}
) {
  const { maxWidth = 1200, quality = 0.7, mimeType = "image/jpeg" } = opts;

  return new Promise<string>((resolve, reject) => {
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

export default function ReportSubmissionEditor({
  report,
  html,
  onChange,
  getAccessToken,
}: Props) {
  const tinyEditorRef = useRef<any>(null);
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const courseId = params.id;
  const assignmentId = report.assignmentId;

  const isGroupSubmission = !!report.isGroupSubmission;
  const isSubmitted = report.status === ReportStatus.Submitted;
  const isResubmitted = report.status === ReportStatus.Resubmitted;

  // Locked when submitted/resubmitted
  const isLocked = isSubmitted || isResubmitted;

  // Only enable collab hub for group + unlocked
  const useHubCollab = isGroupSubmission && !isLocked;
  const readOnly = isLocked;

  const { updateReport, loading: saving } = useUpdateReport();
  const {
    uploadImage,
    uploading: uploadingImages,
    uploadingCount: uploadingImagesCount,
  } = useImageUpload();

  const htmlRef = useRef(html);
  useEffect(() => {
    htmlRef.current = html;
  }, [html]);

  const lastSavedHtmlRef = useRef<string | null>(null);
  const hasSavedRef = useRef(false);
  const [saveRequiredOpen, setSaveRequiredOpen] = useState(false);

  useEffect(() => {
    if (!report.id || typeof window === "undefined") return;
    const key = buildSavedKey(report.id);
    if (window.localStorage.getItem(key) === "1") {
      hasSavedRef.current = true;
    }
  }, [report.id]);

  const markSaved = () => {
    hasSavedRef.current = true;
    if (typeof window !== "undefined" && report.id) {
      const key = buildSavedKey(report.id);
      window.localStorage.setItem(key, "1");
    }
  };

  const clearSavedFlag = () => {
    if (typeof window !== "undefined" && report.id) {
      const key = buildSavedKey(report.id);
      window.localStorage.removeItem(key);
    }
    hasSavedRef.current = false;
  };

  const pushHtmlToEditor = useCallback(
    (nextHtml: string) => {
      onChange(nextHtml);
      tinyEditorRef.current?.pushContentFromOutside?.(nextHtml);
    },
    [onChange]
  );

  const replaceImageSrcInEditor = useCallback(
    (from: string, to: string) => {
      const currentHtml = htmlRef.current ?? "";
      if (!from || !currentHtml.includes(from)) return;
      const nextHtml = replaceImageSrc(currentHtml, from, to);
      htmlRef.current = nextHtml;
      pushHtmlToEditor(nextHtml);
    },
    [pushHtmlToEditor]
  );

  const uploadInlineImagesBeforeSave = useCallback(
    async (htmlInput: string) => {
      const dataSrcs = extractDataImageSrcs(htmlInput);
      if (!dataSrcs.length) return { html: htmlInput, changed: false };

      let nextHtml = htmlInput;
      let counter = 0;

      for (const src of dataSrcs) {
        const file =
          dataUrlToFile(src, `report-image-${Date.now()}-${counter++}.jpg`) ||
          null;
        if (!file) continue;
        if (!isAllowedImage(file)) {
          toast.error(
            "Ảnh không được hỗ trợ. Chỉ nhận .jpg, .jpeg, .png, .gif, .webp."
          );
          continue;
        }

        const res = await uploadImage(file);
        if (res?.imageUrl) {
          nextHtml = replaceImageSrc(nextHtml, src, res.imageUrl);
        }
      }

      return { html: nextHtml, changed: nextHtml !== htmlInput };
    },
    [uploadImage]
  );

  const internalSave = useCallback(
    async (opts?: {
      isAuto?: boolean;
      htmlOverride?: string;
      skipIfDataImages?: boolean;
    }) => {
      if (!report.id) return;

      const currentHtml =
        typeof opts?.htmlOverride === "string"
          ? opts.htmlOverride
          : htmlRef.current ?? "";

      if (opts?.skipIfDataImages && hasDataImages(currentHtml)) return;
      if (currentHtml === lastSavedHtmlRef.current) return;

      const payload: UpdateReportPayload = {
        submission: currentHtml,
      };

      const res = await updateReport(report.id, payload);

      if (res?.success) {
        lastSavedHtmlRef.current = currentHtml;
        markSaved();
        router.refresh();
      }
    },
    [report.id, router, updateReport]
  );

  const handleSave = useCallback(async () => {
    let htmlToSave = htmlRef.current ?? "";

    // Individual: only hit image API when Save is pressed
    if (!isGroupSubmission) {
      const { html: processedHtml, changed } =
        await uploadInlineImagesBeforeSave(htmlToSave);
      if (changed) {
        htmlToSave = processedHtml;
        htmlRef.current = htmlToSave;
        pushHtmlToEditor(htmlToSave);
      }
    }

    await internalSave({ isAuto: false, htmlOverride: htmlToSave });
  }, [internalSave, isGroupSubmission, pushHtmlToEditor, uploadInlineImagesBeforeSave]);

  // Auto-save every minute for individual submissions without inline images waiting
  useEffect(() => {
    if (isLocked || isGroupSubmission || !report.id) return;
    if (typeof window === "undefined") return;

    const intervalId = window.setInterval(() => {
      if (!hasDataImages(htmlRef.current)) {
        void internalSave({ isAuto: true, skipIfDataImages: true });
      }
    }, 60_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [internalSave, isLocked, isGroupSubmission, report.id]);

  const hasSavedOnce = () => {
    if (hasSavedRef.current) return true;
    if (typeof window === "undefined" || !report.id) return false;

    const key = buildSavedKey(report.id);
    return window.localStorage.getItem(key) === "1";
  };

  const handleGoToSubmitPage = () => {
    if (!courseId || !assignmentId) return;

    if (!isGroupSubmission && !hasSavedOnce()) {
      setSaveRequiredOpen(true);
      return;
    }

    clearSavedFlag();

    router.push(
      `/student/courses/${courseId}/reports/submit?assignmentId=${assignmentId}`
    );
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Info banner */}
        <div className="rounded-xl flex flex-col p-3 border border-slate-200 bg-slate-50 text-slate-700 gap-3 md:flex-row md:items-center md:justify-between">
          <div
            className={`flex items-start gap-2 ${
              isGroupSubmission ? "max-w-xl" : "w-full"
            }`}
          >
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="text-xs">
              {isLocked ? (
                isResubmitted ? (
                  <>
                    This report has been <b>resubmitted</b>. You can view the
                    content but further edits are disabled.
                  </>
                ) : (
                  <>
                    This report has been <b>submitted</b>. You can view the
                    content but further edits are disabled.
                  </>
                )
              ) : isGroupSubmission ? (
                <>
                  Edit the <b>submission</b> below. Your changes will sync in
                  real time with other collaborators.
                </>
              ) : (
                <>
                  This is an <b>individual</b> submission. Your report will{" "}
                  <b>auto-save every 1 minute</b>. Images are uploaded only when
                  you press <b>Save</b>.
                </>
              )}
            </div>
          </div>

          {/* Render hub when allowed */}
          {useHubCollab && (
            <div className="md:flex-shrink-0">
              <ReportCollabClient
                reportId={report.id}
                getAccessToken={getAccessToken}
                html={html}
                onRemoteHtml={(newHtml) => {
                  pushHtmlToEditor(newHtml);
                }}
                getEditorRoot={() =>
                  tinyEditorRef.current?.getRoot?.() ?? null
                }
              />
            </div>
          )}
        </div>

        {/* Submission editor */}
        <LiteRichTextEditor
          value={html}
          onChange={readOnly ? () => {} : onChange}
          readOnly={readOnly}
          placeholder={
            readOnly
              ? "Report content (read only)"
              : "Write your report here..."
          }
          className="w-full"
          onInit={(api: any) => {
            tinyEditorRef.current = api;
            if (html) {
              api.pushContentFromOutside?.(html);
            }
          }}
          onUploadImage={
            useHubCollab
              ? async (file) => {
                  if (!isAllowedImage(file)) {
                    toast.error("?nh kh?ng ???c h? tr?. Ch? nh?n .jpg, .jpeg, .png, .gif, .webp.");
                    return "";
                  }
                  // Collab: insert compressed preview, upload in background, then swap to URL
                  const preview = await fileToCompressedDataUrl(file).catch(() => "");
                  if (!preview) {
                    toast.error("Cannot read image for preview.");
                    return "";
                  }

                  void (async () => {
                    const res = await uploadImage(file);
                    if (res?.imageUrl) {
                      replaceImageSrcInEditor(preview, res.imageUrl);
                    } else {
                      toast.error("Image upload failed. Please try again.");
                    }
                  })();

                  return preview;
                }
              : async (file) => {
                  if (!isAllowedImage(file)) {
                    toast.error("?nh kh?ng ???c h? tr?. Ch? nh?n .jpg, .jpeg, .png, .gif, .webp.");
                    return "";
                  }
                  // Individual: only upload on Save; here just return compressed preview
                  const preview = await fileToCompressedDataUrl(file).catch(() => "");
                  if (!preview) {
                    toast.error("Cannot read image for preview.");
                    return "";
                  }
                  return preview;
                }
          }
        />

        {/* Save + Submit */}
        {!isLocked && (
          <div className="mt-2 flex gap-2 justify-end">
            {!isGroupSubmission && (
              <Button
                variant="outline"
                className="h-9 px-3 text-xs rounded-xl"
                disabled={saving || uploadingImages}
                onClick={handleSave}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            )}

            <Button
              onClick={handleGoToSubmitPage}
              className="btn-green-slow h-9 px-4 text-sm rounded-xl"
              disabled={saving || uploadingImages}
            >
              Submit report
            </Button>
          </div>
        )}
      </div>

      {/* Dialog: require save before submit */}
      <Dialog open={saveRequiredOpen} onOpenChange={setSaveRequiredOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save required</DialogTitle>
            <DialogDescription>
              Please save your report at least once (or wait for auto-save)
              before submitting. This helps ensure your latest content is stored
              safely.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              onClick={() => setSaveRequiredOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

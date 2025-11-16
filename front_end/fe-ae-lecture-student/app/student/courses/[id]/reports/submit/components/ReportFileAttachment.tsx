// app/student/courses/[id]/reports/submit/components/ReportFileAttachment.tsx
"use client";

import { useRef } from "react";
import { Upload, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUploadReportFile } from "@/hooks/reports/useUploadReportFile";
import { useDeleteReportFile } from "@/hooks/reports/useDeleteReportFile";

type Props = {
  reportId: string;
  fileUrl: string | null;
  disabled?: boolean;
  onChanged?: (opts?: { fileUrl?: string | null }) => void;
};

export default function ReportFileAttachment({
  reportId,
  fileUrl,
  disabled,
  onChanged,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { uploadFile, loading: uploading } = useUploadReportFile();
  const { deleteFile, loading: deleting } = useDeleteReportFile();

  const handlePickFile = () => {
    if (disabled || uploading || deleting) return;
    inputRef.current?.click();
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // validate size 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File is too large. Max 10MB.");
      e.target.value = "";
      return;
    }

    try {
      const res = await uploadFile(reportId, file);
      if (res?.success) {
        toast.success("File uploaded successfully.");
        onChanged?.({ fileUrl: res.fileUrl });
      } else {
        toast.error(res?.message || "Failed to upload file.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload file.");
    } finally {
      e.target.value = "";
    }
  };

  const handleDelete = async () => {
    if (!fileUrl) return;
    try {
      const res = await deleteFile(reportId);
      if (res?.success) {
        toast.success("File deleted successfully.");
        onChanged?.({ fileUrl: null });
      } else {
        toast.error(res?.message || "Failed to delete file.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete file.");
    }
  };

  const isBusy = uploading || deleting;
  const isDisabled = disabled || isBusy;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-brand text-nav hover:text-nav-active"
          disabled={isDisabled}
          onClick={handlePickFile}
        >
          <Upload className="w-4 h-4 mr-1" />
          {fileUrl ? "Replace file" : "Upload file"}
        </Button>

        {fileUrl && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-600"
            disabled={isBusy}
            onClick={handleDelete}
            title="Remove attachment"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}

        {isBusy && (
          <span className="text-xs text-foreground/60">
            Processing...
          </span>
        )}
      </div>

      <div className="text-xs text-foreground/70 flex items-center gap-1">
        {fileUrl ? (
          <>
            <FileText className="w-3 h-3" />
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 text-nav-active"
            >
              View current file
            </a>
          </>
        ) : (
          <span>No file attached.</span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.zip,.rar"
        onChange={handleFileChange}
      />
    </div>
  );
}
    
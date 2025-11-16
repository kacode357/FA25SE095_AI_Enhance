"use client";

import { useRef } from "react";
import { Upload, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useDeleteReportFile } from "@/hooks/reports/useDeleteReportFile";

type Props = {
  reportId: string;
  fileUrl: string | null;
  disabled?: boolean;

  /** Name of file selected by user but not uploaded yet (from parent) */
  pendingFileName?: string | null;

  /** Called when user selects a new file (only emits File, no API call here) */
  onFileSelected?: (file: File | null) => void;

  /** Called when server-side file changes (e.g. delete) */
  onChanged?: (opts?: { fileUrl?: string | null }) => void;
};

export default function ReportFileAttachment({
  reportId,
  fileUrl,
  disabled,
  pendingFileName,
  onFileSelected,
  onChanged,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { deleteFile, loading: deleting } = useDeleteReportFile();

  const handlePickFile = () => {
    if (disabled || deleting) return;
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // validate size 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File is too large. Max size is 10MB.");
      e.target.value = "";
      return;
    }

    onFileSelected?.(file);
    toast.success("File selected. Click Submit draft to upload.");

    // reset input so selecting the same file again still fires change event
    e.target.value = "";
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

  const isBusy = deleting;
  const isDisabled = disabled || isBusy;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          className="btn-blue-slow text-xs sm:text-sm px-4 py-2 rounded-xl font-semibold shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={isDisabled}
          onClick={handlePickFile}
        >
          <Upload className="w-4 h-4 mr-1" />
          {fileUrl || pendingFileName ? "Change file" : "Upload file"}
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
          <span className="text-xs text-foreground/60">Processing...</span>
        )}
      </div>

      <div className="text-xs text-foreground/70 flex items-center gap-1">
        {pendingFileName ? (
          <>
            <FileText className="w-3 h-3" />
            <span>
              Selected:&nbsp;
              <span className="font-medium">{pendingFileName}</span>
              &nbsp;
              <span className="text-[10px] text-foreground/50">
                (not uploaded yet)
              </span>
            </span>
          </>
        ) : fileUrl ? (
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

"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { FileText, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CsvPreview = {
  delimiter: string;
  headers: string[];
  rows: string[][];
  totalRows: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (file: File) => Promise<void> | void;
  uploading?: boolean;
};

const MAX_PREVIEW_ROWS = 12;
const MAX_PARSE_LINES = 200;

// Đảm bảo nhiều cột sẽ overflow => có scroll ngang
const COL_MIN_WIDTH = 180;

const countDelimiter = (line: string, delimiter: string) => {
  let count = 0;
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        i += 1;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && ch === delimiter) count += 1;
  }
  return count;
};

const detectDelimiter = (line: string) => {
  const commaCount = countDelimiter(line, ",");
  const semiCount = countDelimiter(line, ";");
  return semiCount > commaCount ? ";" : ",";
};

const parseCsvLine = (line: string, delimiter: string) => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && ch === delimiter) {
      result.push(current.trim());
      current = "";
      continue;
    }

    current += ch;
  }

  result.push(current.trim());
  return result;
};

const buildPreview = (text: string): CsvPreview | null => {
  const sanitized = text.replace(/^\uFEFF/, "");
  const rawLines = sanitized.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (!rawLines.length) return null;

  const delimiter = detectDelimiter(rawLines[0]);
  const parseLines = rawLines.slice(0, MAX_PARSE_LINES);
  const parsed = parseLines.map((line) => parseCsvLine(line, delimiter));
  if (!parsed.length) return null;

  const headers = parsed[0].length ? parsed[0] : [];
  const bodyRows = parsed.slice(1, MAX_PREVIEW_ROWS + 1);

  const maxLen = Math.max(headers.length, ...bodyRows.map((row) => row.length), 0);

  const normalizedHeaders =
    maxLen > 0
      ? Array.from({ length: maxLen }).map((_, idx) => headers[idx] || `Column ${idx + 1}`)
      : [];

  const normalizedRows = bodyRows.map((row) => {
    if (row.length >= maxLen) return row;
    return [...row, ...Array.from({ length: maxLen - row.length }, () => "")];
  });

  return {
    delimiter,
    headers: normalizedHeaders,
    rows: normalizedRows,
    totalRows: Math.max(rawLines.length - 1, 0),
  };
};

const CrawlerCsvUploadDialog = ({
  open,
  onOpenChange,
  onConfirm,
  uploading = false,
}: Props) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CsvPreview | null>(null);

  const handleChooseFile = useCallback(() => {
    if (uploading) return;
    fileInputRef.current?.click();
  }, [uploading]);

  const resetState = useCallback(() => {
    setSelectedFile(null);
    setPreview(null);
  }, []);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) resetState();
      onOpenChange(nextOpen);
    },
    [onOpenChange, resetState]
  );

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    event.target.value = "";
    if (!file) return;

    try {
      const text = await file.text();
      const nextPreview = buildPreview(text);
      if (!nextPreview) {
        toast.error("Unable to read CSV preview. Please check the file content.");
        setSelectedFile(null);
        setPreview(null);
        return;
      }
      setSelectedFile(file);
      setPreview(nextPreview);
    } catch {
      toast.error("Failed to read CSV file.");
      setSelectedFile(null);
      setPreview(null);
    }
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!selectedFile || uploading) return;
    await onConfirm(selectedFile);
    handleOpenChange(false);
  }, [handleOpenChange, onConfirm, selectedFile, uploading]);

  const fileMeta = useMemo(() => {
    if (!selectedFile) return null;
    const sizeKb = Math.round(selectedFile.size / 1024);
    return `${selectedFile.name} • ${sizeKb} KB`;
  }, [selectedFile]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* FIX CORE LAYOUT:
          - flex flex-col: chia header/body/footer chuẩn
          - max-h-[90vh] thay vì h để tránh đo height sai trong dialog transform
          - overflow-hidden để không văng ra ngoài
      */}
      <DialogContent className="w-[98vw] max-w-[1200px] lg:max-w-[1400px] p-0 flex flex-col max-h-[90vh] overflow-hidden">
        {/* HEADER (shrink-0) */}
        <DialogHeader className="shrink-0 px-6 py-5">
          <DialogTitle>Upload file</DialogTitle>
          <DialogDescription>
            Choose a CSV file to preview the content before confirming the upload.
          </DialogDescription>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              type="button"
              onClick={handleChooseFile}
              className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[var(--border)] bg-slate-50 px-3 py-2 text-[11px] font-semibold text-[var(--brand)] transition hover:bg-[var(--brand)]/10"
            >
              <Upload className="h-4 w-4" />
              Choose file
            </button>

            {fileMeta && (
              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                <FileText className="h-4 w-4 text-slate-400" />
                <span>{fileMeta}</span>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* BODY (flex-1 + min-h-0 + overflow-auto) => chỉ body scroll */}
        <div className="flex-1 min-h-0 px-6 pb-4 overflow-auto">
          {preview ? (
            <div className="min-h-full rounded-lg border border-[var(--border)] bg-white flex flex-col">
              <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] px-3 py-2 text-[10px] text-slate-500">
                <span>Delimiter: {preview.delimiter === ";" ? ";" : ","}</span>
                <span>Rows: {preview.totalRows}</span>
                <span>Preview: first {preview.rows.length} rows</span>
              </div>

              {/* TABLE ZONE: tự scroll ngang/dọc, nhưng vẫn nằm trong body */}
              <div className="flex-1 min-h-0 w-full overflow-x-auto overflow-y-auto">
                <div className="min-w-max">
                  <table className="min-w-max text-left text-[11px]">
                    <thead className="sticky top-0 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500 z-10">
                      <tr>
                        {preview.headers.map((header, idx) => (
                          <th
                            key={idx}
                            className="border-b border-[var(--border)] px-3 py-2 font-semibold whitespace-nowrap"
                            style={{ minWidth: COL_MIN_WIDTH }}
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.rows.map((row, rowIdx) => (
                        <tr key={rowIdx} className="odd:bg-slate-50/60">
                          {row.map((cell, cellIdx) => (
                            <td
                              key={cellIdx}
                              className="border-b border-[var(--border)] px-3 py-2 text-slate-700 whitespace-nowrap"
                              style={{ minWidth: COL_MIN_WIDTH }}
                            >
                              {cell || "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full rounded-lg border border-dashed border-[var(--border)] bg-slate-50/60 px-3 py-6 text-center text-[11px] text-slate-500 flex items-center justify-center">
              Select a file to preview.
            </div>
          )}
        </div>

        {/* FOOTER:
            - shrink-0: không bị body đè
            - sticky bottom-0: luôn hiện ngay cả khi body scroll
        */}
        <div className="shrink-0 sticky bottom-0 border-t border-[var(--border)] bg-white px-6 py-4">
          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
              disabled={uploading}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedFile || uploading}
              className="btn btn-blue-slow h-9 px-4 text-[11px] font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm upload"}
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CrawlerCsvUploadDialog;

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, Link as LinkIcon, Loader2, RefreshCcw } from "lucide-react";

import { useGetConversationFiles } from "@/hooks/chat/useGetConversationFiles";
import type { ConversationFileItemResponse } from "@/types/chat/chat.response";
import { formatDateTimeVN } from "@/utils/datetime/format-datetime";

type CsvPreview = {
  delimiter: string;
  headers: string[];
  rows: string[][];
  totalRows: number;
  truncated: boolean;
};

type Props = {
  conversationId: string | null;
  active?: boolean;
};

const MAX_PREVIEW_ROWS = 12;
const MAX_PARSE_LINES = 200;
const COL_MIN_WIDTH = 160;

const formatBytes = (value?: number | null) => {
  if (!value || value <= 0) return "-";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = value;
  let idx = 0;
  while (size >= 1024 && idx < units.length - 1) {
    size /= 1024;
    idx += 1;
  }
  return `${size.toFixed(size >= 10 || idx === 0 ? 0 : 1)} ${units[idx]}`;
};

const isCsvFile = (fileName?: string | null, fileUrl?: string | null) => {
  const name = fileName || fileUrl || "";
  return name.toLowerCase().includes(".csv");
};

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

const buildPreview = (text: string, truncated: boolean): CsvPreview | null => {
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
    truncated,
  };
};

const truncateUrl = (url?: string | null) => {
  if (!url) return "-";
  if (url.length <= 60) return url;
  return `${url.slice(0, 38)}...${url.slice(-16)}`;
};

const formatColumns = (columns?: string[] | null) => {
  if (!columns?.length) return null;
  const preview = columns.slice(0, 6).join(", ");
  return columns.length > 6 ? `${preview}...` : preview;
};

const CrawlerConversationFilesSection = ({ conversationId, active = true }: Props) => {
  const { getConversationFiles, clearFiles, loading, files } = useGetConversationFiles();
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [preview, setPreview] = useState<CsvPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const selectedFile = useMemo(
    () => files.find((file) => file.id === selectedFileId) || null,
    [files, selectedFileId]
  );

  useEffect(() => {
    setSelectedFileId(null);
    setPreview(null);
    setPreviewError(null);
  }, [conversationId]);

  useEffect(() => {
    if (!active) return;
    if (!conversationId) {
      clearFiles();
      return;
    }
    getConversationFiles(conversationId).catch((err) =>
      console.error("[CrawlerFiles] fetch files error:", err)
    );
  }, [active, clearFiles, conversationId, getConversationFiles]);

  const handleRefresh = useCallback(() => {
    if (!conversationId) return;
    getConversationFiles(conversationId).catch((err) =>
      console.error("[CrawlerFiles] refresh files error:", err)
    );
  }, [conversationId, getConversationFiles]);

  const handlePreview = useCallback(async (file: ConversationFileItemResponse) => {
    setSelectedFileId(file.id);
    setPreview(null);
    setPreviewError(null);

    if (!file.fileUrl) {
      setPreviewError("Missing file url.");
      return;
    }

    if (!isCsvFile(file.fileName, file.fileUrl)) {
      setPreviewError("Preview supports CSV files only.");
      return;
    }

    setPreviewLoading(true);
    try {
      const res = await fetch(
        `/api/crawler-files/preview?url=${encodeURIComponent(file.fileUrl)}`,
        { method: "GET", cache: "no-store" }
      );
      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload?.success) {
        const message = payload?.message || `Failed to load file (${res.status})`;
        throw new Error(message);
      }
      const text = typeof payload.text === "string" ? payload.text : "";
      const truncated = Boolean(payload.truncated);
      const nextPreview = buildPreview(text, truncated);
      if (!nextPreview) {
        setPreviewError("Unable to parse CSV preview.");
      } else {
        setPreview(nextPreview);
      }
    } catch (err: any) {
      console.error("[CrawlerFiles] preview error:", err);
      setPreviewError(err?.message || "Failed to load file preview.");
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  const previewMeta = useMemo(() => {
    if (!selectedFile) return null;
    return {
      name: selectedFile.fileName,
      rows: selectedFile.rowCount ?? null,
      size: formatBytes(selectedFile.fileSize),
      columns: formatColumns(selectedFile.columnNames),
    };
  }, [selectedFile]);

  return (
    <div className="card p-3 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
          <LinkIcon className="h-4 w-4 text-[var(--brand)]" />
          Uploaded Files
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={!conversationId || loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-600 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCcw className="h-3 w-3" />
          Refresh
        </button>
      </div>

      {!conversationId ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-slate-50/60 px-3 py-6 text-center text-[11px] text-slate-500">
          Select a conversation to load uploaded files.
        </div>
      ) : loading ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-slate-50/60 px-3 py-6 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading files...
        </div>
      ) : files.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-slate-50/60 px-3 py-6 text-center text-[11px] text-slate-500">
          No uploaded files yet.
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => {
            const isActive = file.id === selectedFileId;
            return (
              <div
                key={file.id}
                className={`rounded-xl border border-[var(--border)] bg-white p-3 shadow-sm transition ${
                  isActive ? "ring-2 ring-[var(--brand)]/30" : ""
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[var(--foreground)]">
                      <FileText className="h-4 w-4 text-slate-400" />
                      {file.fileName || "Untitled file"}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Uploaded: {formatDateTimeVN(file.uploadedAt)}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Rows: {file.rowCount ?? "-"} | Size: {formatBytes(file.fileSize)}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      File URL:{" "}
                      {file.fileUrl ? (
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[var(--brand)] underline"
                          title={file.fileUrl}
                        >
                          {truncateUrl(file.fileUrl)}
                        </a>
                      ) : (
                        "-"
                      )}
                    </div>
                    {file.columnNames?.length ? (
                      <div className="text-[10px] text-slate-500">
                        Columns: {formatColumns(file.columnNames)}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePreview(file)}
                      disabled={!file.fileUrl}
                      className="rounded-lg border border-[var(--border)] bg-white px-3 py-1 text-[10px] font-semibold text-slate-600 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Preview
                    </button>
                    {file.fileUrl && (
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-[var(--border)] bg-white px-3 py-1 text-[10px] font-semibold text-[var(--brand)] shadow-sm hover:bg-slate-50"
                      >
                        Open file
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-xl border border-[var(--border)] bg-white overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] bg-slate-50 px-3 py-2 text-[10px] text-slate-600">
          <div className="font-semibold text-slate-700">Preview</div>
          {previewMeta && (
            <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
              <span>{previewMeta.name}</span>
              <span>Rows: {previewMeta.rows ?? "-"}</span>
              <span>Size: {previewMeta.size}</span>
              {previewMeta.columns && <span>Columns: {previewMeta.columns}</span>}
            </div>
          )}
        </div>

        <div className="max-h-[320px] overflow-auto">
          {previewLoading ? (
            <div className="flex items-center justify-center gap-2 px-3 py-6 text-[11px] text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading preview...
            </div>
          ) : previewError ? (
            <div className="px-3 py-6 text-center text-[11px] text-rose-500">
              {previewError}
            </div>
          ) : preview ? (
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
          ) : (
            <div className="px-3 py-6 text-center text-[11px] text-slate-500">
              Select a file above to preview its content.
            </div>
          )}
        </div>

        {preview?.truncated && (
          <div className="border-t border-[var(--border)] bg-slate-50 px-3 py-2 text-[10px] text-slate-500">
            Preview truncated to the first {MAX_PREVIEW_ROWS} rows.
          </div>
        )}
      </div>
    </div>
  );
};

export default CrawlerConversationFilesSection;

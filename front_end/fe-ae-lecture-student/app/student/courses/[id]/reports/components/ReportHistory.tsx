// app/student/courses/[id]/reports/components/ReportHistory.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, Loader2, Activity, AlertCircle } from "lucide-react";

import { useGetReportHistory } from "@/hooks/reports/useGetReportHistory";
import type { ReportHistoryItem } from "@/types/reports/reports.response";
import type { GetReportHistoryQuery } from "@/types/reports/reports.payload";

import LiteRichTextEditor from "@/components/common/TinyMCE";
import { formatDateTimeVN } from "@/utils/datetime/format-datetime";
import { buildHtmlWordDiff } from "@/utils/diff/htmlWordDiff";

type Props = {
  reportId: string;
  className?: string;
  payloadOverrides?: Omit<Partial<GetReportHistoryQuery>, "reportId">;
};

type FieldChange = {
  old: string;
  new: string;
};

export default function ReportHistory({
  reportId,
  className = "",
  payloadOverrides,
}: Props) {
  const { getReportHistory, loading } = useGetReportHistory();

  const [item, setItem] = useState<ReportHistoryItem | null>(null);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payloadKey = useMemo(
    () => JSON.stringify(payloadOverrides || {}),
    [payloadOverrides]
  );

  const loadHistory = async () => {
    if (!reportId) return;

    setError(null);
    setInitialLoaded(false);

    const basePayload: GetReportHistoryQuery = {
      reportId,
      pageNumber: 1,
      pageSize: 1,
    };

    const overrides = payloadOverrides || {};
    const payload: GetReportHistoryQuery = {
      ...basePayload,
      ...overrides,
      reportId,
      pageNumber: 1,
      pageSize: 1,
    };

    const res = await getReportHistory(payload);
    if (!res) {
      setError("Failed to load history.");
      setInitialLoaded(true);
      return;
    }

    const first = res.history && res.history.length > 0 ? res.history[0] : null;
    setItem(first);
    setInitialLoaded(true);
  };

  useEffect(() => {
    if (!reportId) return;
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId, payloadKey]);

  const renderContent = () => {
    if (!initialLoaded && loading) {
      return (
        <div className="py-6 flex items-center justify-center text-sm text-slate-500">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Loading history…
        </div>
      );
    }

    if (initialLoaded && error) {
      return (
        <div className="py-4 flex items-center gap-2 text-sm text-rose-600">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      );
    }

    if (initialLoaded && !item) {
      return (
        <div className="py-4 text-sm text-slate-500">
          No history records yet.
        </div>
      );
    }

    if (!item) return null;

    const versionLabel = item.fullVersion
      ? `v${item.fullVersion}`
      : `v${item.version}`;

    const contributors =
      item.contributorNames && item.contributorNames.length > 0
        ? item.contributorNames.join(", ")
        : "";

    const changes = (item.changes || {}) as Record<string, FieldChange>;
    const submissionChange = changes.Submission;
    const filePathChange = changes.FilePath;
    const statusChange = changes.Status;

    const changeSummary = (item as any).changeSummary as
      | string
      | null
      | undefined;

    const renderChangeSummary = (summary: string) => {
      const parts = summary.split(" ");
      return parts.map((part, idx) => {
        let cls = "";
        if (part.startsWith("+")) cls = "text-emerald-600";
        else if (part.startsWith("-")) cls = "text-rose-600";
        return (
          <span key={idx} className={cls}>
            {part}
            {idx < parts.length - 1 ? " " : ""}
          </span>
        );
      });
    };

    const renderPlainChange = (title: string, field?: FieldChange) => {
      const oldVal = field?.old ?? "";
      const newVal = field?.new ?? "";
      const displayOld = oldVal === "" ? "Empty" : oldVal;
      const displayNew = newVal === "" ? "Empty" : newVal;

      return (
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
          <div className="mb-2 text-xs font-semibold text-slate-700">
            {title}
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="mb-1 text-[11px] font-medium text-slate-400">
                Before
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-1.5 text-slate-700 break-words">
                {displayOld}
              </div>
            </div>
            <div>
              <div className="mb-1 text-[11px] font-medium text-slate-400">
                After
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-1.5 text-slate-700 break-words">
                {displayNew}
              </div>
            </div>
          </div>
        </div>
      );
    };

    // ===== Submission diff dùng util buildHtmlWordDiff =====
    const originalOldHtml = submissionChange?.old || "";
    const originalNewHtml = submissionChange?.new || "";

    let highlightedOldHtml = originalOldHtml;
    let highlightedNewHtml = originalNewHtml;

    if (originalOldHtml && originalNewHtml) {
      const { oldHighlighted, newHighlighted } = buildHtmlWordDiff(
        originalOldHtml,
        originalNewHtml
      );
      highlightedOldHtml = oldHighlighted;
      highlightedNewHtml = newHighlighted;
    }

    return (
      <div className="flex flex-col gap-4">
        {/* Top info */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-semibold text-nav">
                {item.action || "Updated"}{" "}
                <span className="text-xs font-normal text-slate-500">
                  {versionLabel}
                </span>
              </div>
              {contributors && (
                <div className="text-xs text-slate-600">
                  Changes by <span className="font-medium">{contributors}</span>
                </div>
              )}
            </div>

            <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500 sm:mt-0">
              <Clock className="w-3 h-3" />
              <span>{formatDateTimeVN(item.changedAt)}</span>
            </div>
          </div>
        </div>

        {/* Changed fields */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-500">
              CHANGED FIELDS
            </div>
            {changeSummary && (
              <div className="text-[11px] text-slate-500">
                {renderChangeSummary(changeSummary)}
              </div>
            )}
          </div>
          <div className="space-y-3">
            {/* Submission (HTML) với diff màu */}
            {submissionChange && (
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                <div className="mb-2 text-xs font-semibold text-slate-700">
                  Submission
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <div className="mb-1 text-[11px] font-medium text-slate-400">
                      Before
                    </div>
                    {submissionChange.old ? (
                      <LiteRichTextEditor
                        value={highlightedOldHtml}
                        onChange={() => {}}
                        readOnly
                        debounceMs={0}
                        className="border border-slate-100 rounded-lg bg-slate-50/60 [&_.tox-tinymce]:min-h-[140px]"
                      />
                    ) : (
                      <div className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-1.5 text-xs text-slate-400 italic">
                        Empty
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="mb-1 text-[11px] font-medium text-slate-400">
                      After
                    </div>
                    {submissionChange.new ? (
                      <LiteRichTextEditor
                        value={highlightedNewHtml}
                        onChange={() => {}}
                        readOnly
                        debounceMs={0}
                        className="border border-slate-100 rounded-lg bg-slate-50/60 [&_.tox-tinymce]:min-h-[140px]"
                      />
                    ) : (
                      <div className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-1.5 text-xs text-slate-400 italic">
                        Empty
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* FilePath luôn hiện (nếu backend gửi) */}
            {renderPlainChange("FilePath", filePathChange)}

            {/* Status luôn hiện (nếu backend gửi) */}
            {renderPlainChange("Status", statusChange)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`card rounded-2xl p-4 border border-slate-200 bg-white h-full flex flex-col ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-nav-active" />
          <h2 className="text-base font-semibold text-nav">
            Latest change overview
          </h2>
        </div>

        {loading && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Loading…</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">{renderContent()}</div>
    </div>
  );
}

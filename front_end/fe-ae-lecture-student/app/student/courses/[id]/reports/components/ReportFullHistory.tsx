// app/student/courses/[id]/reports/components/ReportFullHistory.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  Clock,
  Loader2,
  ChevronRight,
  ArrowLeft,
  RotateCcw,
  ChevronsUpDown,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { useGetReportHistory } from "@/hooks/reports/useGetReportHistory";
import { useRevertReport } from "@/hooks/reports/useRevertReport";
import type { ReportHistoryItem } from "@/types/reports/reports.response";
import type { GetReportHistoryQuery } from "@/types/reports/reports.payload";

import LiteRichTextEditor from "@/components/common/TinyMCE";
import { formatDateTimeVN } from "@/utils/datetime/format-datetime";
import { buildHtmlWordDiff } from "@/utils/diff/htmlWordDiff";

type Props = {
  reportId: string;
  className?: string;
  /** Bấm Back để quay về Latest activity (ReportHistory) */
  onBackToLatest?: () => void;
  /** Sau khi revert thành công -> cho parent refetch report */
  onRevertSuccess?: () => void | Promise<void>;
};

type FieldChange = {
  old: string;
  new: string;
};

export default function ReportFullHistory({
  reportId,
  className = "",
  onBackToLatest,
  onRevertSuccess,
}: Props) {
  const { getReportHistory, loading: historyLoading } = useGetReportHistory();
  const { revertReport, loading: revertLoading } = useRevertReport();

  const [items, setItems] = useState<ReportHistoryItem[]>([]);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize] = useState<number>(20);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentVersion, setCurrentVersion] = useState<number | null>(null);

  const loadHistory = async (page: number) => {
    if (!reportId) return;

    setError(null);
    setInitialLoaded(false);

    const payload: GetReportHistoryQuery = {
      reportId,
      pageNumber: page,
      pageSize,
    };

    const res = await getReportHistory(payload);
    if (!res) {
      setError("Failed to load full history.");
      setInitialLoaded(true);
      return;
    }

    const list = res.history || [];
    setItems(list);
    setHasNext(res.hasNext);
    setHasPrevious(res.hasPrevious);
    setTotalPages(res.totalPages || 1);
    setCurrentVersion(res.currentVersion ?? null);

    if (!selectedId && list.length > 0) {
      setSelectedId(list[0].id);
    }

    setInitialLoaded(true);
  };

  useEffect(() => {
    loadHistory(pageNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId, pageNumber]);

  const handlePrev = () => {
    if (hasPrevious && pageNumber > 1) {
      setPageNumber((p) => p - 1);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setPageNumber((p) => p + 1);
    }
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

  const renderDetailForItem = (item: ReportHistoryItem | null) => {
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

    const isCurrent =
      currentVersion !== null && item.version === currentVersion;
    const buttonLabel = isCurrent ? "Current version" : "Revert to this version";

    const handleRevertClick = async () => {
      if (isCurrent) return; // Không revert version hiện tại

      await revertReport({
        reportId,
        version: item.version,
        comment: "",
      });

      // reload history sau khi revert
      await loadHistory(pageNumber);

      // báo cho parent refetch lại report + editor
      if (onRevertSuccess) {
        await onRevertSuccess();
      }
    };

    // ===== Diff Submission dùng util buildHtmlWordDiff =====
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
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-semibold text-nav">
                {item.action || "Updated"}{" "}
                <span className="text-xs font-normal text-slate-500">
                  {versionLabel}
                  {isCurrent && (
                    <span className="ml-2 text-[10px] font-semibold text-emerald-600">
                      (Current)
                    </span>
                  )}
                </span>
              </div>
              {contributors && (
                <div className="text-xs text-slate-600">
                  Changes by{" "}
                  <span className="font-medium">{contributors}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 items-end sm:items-end">
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <Clock className="w-3 h-3" />
                <span>{formatDateTimeVN(item.changedAt)}</span>
              </div>

              <button
                type="button"
                onClick={handleRevertClick}
                disabled={isCurrent || revertLoading || historyLoading}
                className={`btn px-3 py-1.5 text-[11px] font-semibold disabled:opacity-60 disabled:cursor-not-allowed ${isCurrent ? "bg-slate-100 text-slate-400" : "btn-blue-slow"
                  }`}
              >
                {revertLoading && !isCurrent ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Reverting…
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3 h-3 mr-1" />
                    {buttonLabel}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Changed fields */}
        <div>
          <div className="mb-2 text-xs font-semibold text-slate-500">
            CHANGED FIELDS
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
                        onChange={() => { }}
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
                        onChange={() => { }}
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

            {/* FilePath */}
            {renderPlainChange("FilePath", filePathChange)}

            {/* Status */}
            {renderPlainChange("Status", statusChange)}
          </div>
        </div>
      </div>
    );
  };

  const selected =
    items.find((i) => i.id === selectedId) || (items[0] ?? null);

  // ✅ Group theo version lớn
  const groupedByVersion: Record<number, ReportHistoryItem[]> = {};
  items.forEach((it) => {
    const v = it.version ?? 0;
    if (!groupedByVersion[v]) groupedByVersion[v] = [];
    groupedByVersion[v].push(it);
  });

  // Sort version lớn: mới → cũ
  const majorVersions = Object.keys(groupedByVersion)
    .map((v) => Number(v))
    .sort((a, b) => b - a);

  return (
    <div
      className={`card rounded-2xl p-4 border border-slate-200 bg-white h-full flex flex-col ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-nav-active" />
          <h2 className="text-base font-semibold text-nav">
            Full version history
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {onBackToLatest && (
            <button
              type="button"
              onClick={onBackToLatest}
              className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back to latest activity</span>
            </button>
          )}

          {historyLoading && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Loading…</span>
            </div>
          )}
        </div>
      </div>

      {/* Body 3/7 */}
      <div className="flex-1 min-h-0">
        {!initialLoaded && historyLoading && items.length === 0 && (
          <div className="h-full flex items-center justify-center text-sm text-slate-500">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Loading version history…
          </div>
        )}

        {initialLoaded && error && (
          <div className="flex items-center gap-2 text-sm text-rose-600">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {initialLoaded && !error && items.length === 0 && (
          <div className="text-sm text-slate-500">
            No history records yet.
          </div>
        )}

        {items.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,7fr)] h-full">
            {/* LEFT: list (3) */}
            <div className="flex flex-col min-h-0 border border-slate-200 rounded-2xl bg-slate-50/60">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200">
                <span className="text-xs font-semibold text-slate-600">
                  Versions
                </span>

                {totalPages > 1 && (
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <button
                      type="button"
                      onClick={handlePrev}
                      disabled={!hasPrevious || historyLoading}
                      className="px-2 py-1 border border-slate-200 rounded-md bg-white disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <span>
                      Page {pageNumber} / {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!hasNext || historyLoading}
                      className="px-2 py-1 border border-slate-200 rounded-md bg-white disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-2">
                {majorVersions.length === 0 ? (
                  <div className="text-xs text-slate-500">No versions</div>
                ) : (
                  <div className="space-y-2">
                    {majorVersions.map((version) => {
                      const versionItems = groupedByVersion[version] || [];
                      const isCurrentGroup =
                        currentVersion !== null &&
                        currentVersion === version;
                      const latestInGroup = versionItems[0];

                      return (
                        <Collapsible
                          key={version}
                          defaultOpen={version === majorVersions[0]} // mở version mới nhất
                          className="rounded-xl border border-slate-200 bg-white/80 px-2 py-2"
                        >
                          {/* Header version lớn */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1 text-xs font-semibold text-nav">
                                <span>Version {version}</span>
                                {isCurrentGroup && (
                                  <span className="text-[10px] font-semibold text-emerald-600">
                                    (Current)
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {versionItems.length}{" "}
                                {versionItems.length > 1
                                  ? "changes"
                                  : "change"}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {latestInGroup?.changedAt && (
                                <span className="flex items-center gap-1 text-[10px] text-slate-500">
                                  <Clock className="w-3 h-3" />
                                  {formatDateTimeVN(
                                    latestInGroup.changedAt
                                  )}
                                </span>
                              )}

                              <CollapsibleTrigger asChild>
                                <button
                                  type="button"
                                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-slate-50 px-2 py-1 hover:bg-slate-100"
                                >
                                  <ChevronsUpDown className="w-3 h-3" />
                                  <span className="sr-only">
                                    Toggle version {version}
                                  </span>
                                </button>
                              </CollapsibleTrigger>
                            </div>
                          </div>

                          {/* List chi tiết nhỏ trong version */}
                          <CollapsibleContent className="mt-2 space-y-2">
                            <ol className="space-y-2">
                              {versionItems.map((it) => {
                                const isActive = selected?.id === it.id;
                                const versionLabel = it.fullVersion
                                  ? `v${it.fullVersion}`
                                  : `v${it.version}`;

                                const contributors =
                                  it.contributorNames && it.contributorNames.length > 0
                                    ? it.contributorNames.join(", ")
                                    : "";

                                // ❌ BỎ `isCurrent` ở đây, không cần đánh dấu Current nữa
                                // const isCurrent =
                                //   currentVersion !== null && it.version === currentVersion;

                                return (
                                  <li key={it.id}>
                                    <button
                                      type="button"
                                      onClick={() => setSelectedId(it.id)}
                                      className={`w-full text-left rounded-xl border px-3 py-2 text-xs transition-colors ${isActive
                                          ? "border-nav-active bg-violet-50/80"
                                          : "border-transparent hover:border-slate-200 hover:bg-white"
                                        }`}
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="text-[11px] font-semibold text-nav">
                                          {it.action || "Updated"}{" "}
                                          <span className="text-[10px] font-normal text-slate-500">
                                            {versionLabel}
                                            {/* ❌ XÓA LABEL (Current) Ở ĐÂY */}
                                            {/* {isCurrent && (
                    <span className="ml-1 text-[9px] font-semibold text-emerald-600">
                      (Current)
                    </span>
                  )} */}
                                          </span>
                                        </span>
                                        <span className="flex items-center gap-1 text-[10px] text-slate-500">
                                          <Clock className="w-3 h-3" />
                                          {formatDateTimeVN(it.changedAt)}
                                        </span>
                                      </div>
                                      {contributors && (
                                        <div className="mt-1 text-[11px] text-slate-600 line-clamp-1">
                                          By {contributors}
                                        </div>
                                      )}
                                      <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                                        <span>Details</span>
                                        <ChevronRight className="w-3 h-3" />
                                      </div>
                                    </button>
                                  </li>
                                );
                              })}
                            </ol>
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: detail (7) */}
            <div className="min-h-0 overflow-y-auto">
              {renderDetailForItem(selected)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

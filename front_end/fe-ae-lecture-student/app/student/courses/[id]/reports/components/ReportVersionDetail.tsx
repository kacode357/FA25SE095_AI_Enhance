// app/student/courses/[id]/reports/components/ReportVersionDetail.tsx
"use client";

import { useEffect, useState } from "react";
import { Clock, Loader2, AlertCircle, Info } from "lucide-react";

import { useGetReportHistoryVersion } from "@/hooks/reports/useGetReportHistoryVersion";
import type { GetReportHistoryVersionResponse } from "@/types/reports/reports.response";

type Props = {
  reportId: string;
  version: number | null;
};

const dt = (s?: string | null) => {
  if (!s) return "";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s || "";
  return d.toLocaleString("en-GB");
};

export default function ReportVersionDetail({ reportId, version }: Props) {
  const { getReportHistoryVersion, loading } = useGetReportHistoryVersion();
  const [detail, setDetail] = useState<GetReportHistoryVersionResponse | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [showTechnical, setShowTechnical] = useState(false);

  useEffect(() => {
    if (!reportId || !version) {
      setDetail(null);
      setError(null);
      return;
    }

    let mounted = true;

    (async () => {
      setError(null);
      setDetail(null);
      const res = await getReportHistoryVersion({ reportId, version });
      if (!mounted) return;

      if (!res) {
        setError("Failed to load version details.");
        return;
      }
      setDetail(res);
    })();

    return () => {
      mounted = false;
    };
  }, [reportId, version, getReportHistoryVersion]);

  return (
    <div className="h-full rounded-2xl border border-slate-200 bg-slate-50/80 p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <Info className="w-4 h-4 text-nav-active" />
        <h3 className="text-sm font-semibold text-nav">Version details</h3>
      </div>

      {!version && (
        <div className="flex-1 flex items-center justify-center text-xs text-slate-500 text-center px-4">
          Select a version on the left to see what changed.
        </div>
      )}

      {version && loading && !detail && !error && (
        <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Loading version {version}…
        </div>
      )}

      {version && error && (
        <div className="flex-1 flex items-center justify-center text-xs text-rose-600">
          <AlertCircle className="w-4 h-4 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {version && detail && (
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1 text-xs text-slate-700">
          {/* Header info */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-nav">
                {detail.action}{" "}
                <span className="text-xs text-slate-500">v{detail.version}</span>
              </div>

              {detail.contributorNames?.length > 0 && (
                <div className="mt-1">
                  <span className="font-medium">Contributors:</span>{" "}
                  <span>{detail.contributorNames.join(", ")}</span>
                </div>
              )}

              {detail.comment && (
                <div className="mt-1">
                  <span className="font-medium">Note:</span>{" "}
                  <span>{detail.comment}</span>
                </div>
              )}

              {detail.changeSummary && (
                <div className="mt-1 text-slate-600">
                  <span className="font-medium">Change summary:</span>{" "}
                  <span>{detail.changeSummary}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-end text-[11px] text-slate-500 gap-1">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{dt(detail.changedAt)}</span>
              </div>
            </div>
          </div>

          {/* Changed fields – user friendly */}
          {detail.changes && Object.keys(detail.changes).length > 0 && (
            <div className="mt-2">
              <div className="text-[11px] font-semibold uppercase text-slate-500 mb-2">
                Changed fields
              </div>
              <div className="space-y-2">
                {Object.entries(detail.changes).map(
                  ([field, value]: [string, any]) => {
                    const oldVal =
                      value && typeof value === "object" && "old" in value
                        ? value.old
                        : "";
                    const newVal =
                      value && typeof value === "object" && "new" in value
                        ? value.new
                        : "";

                    const oldText =
                      typeof oldVal === "string"
                        ? oldVal
                        : JSON.stringify(oldVal ?? "");
                    const newText =
                      typeof newVal === "string"
                        ? newVal
                        : JSON.stringify(newVal ?? "");

                    return (
                      <div
                        key={field}
                        className="rounded-lg border border-slate-200 bg-white p-2"
                      >
                        <div className="text-[11px] font-medium text-slate-600 mb-1">
                          {field}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="text-[11px] text-slate-500">
                              Before
                            </div>
                            <div className="mt-1 rounded-md bg-slate-50 px-2 py-1 text-[11px] text-slate-700 break-words max-h-20 overflow-hidden">
                              {oldText || <span className="italic">Empty</span>}
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px] text-slate-500">
                              After
                            </div>
                            <div className="mt-1 rounded-md bg-slate-50 px-2 py-1 text-[11px] text-slate-700 break-words max-h-20 overflow-hidden">
                              {newText || <span className="italic">Empty</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* Optional technical diff toggle */}
          {(detail.unifiedDiff || detail.changeDetails) && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setShowTechnical((v) => !v)}
                className="text-[11px] font-medium text-nav-active hover:underline"
              >
                {showTechnical ? "Hide technical diff" : "Show technical diff"}
              </button>

              {showTechnical && (
                <div className="mt-2 space-y-2">
                  {detail.unifiedDiff && (
                    <div>
                      <div className="text-[11px] font-semibold text-slate-500 mb-1">
                        Unified diff
                      </div>
                      <pre className="max-h-40 overflow-auto rounded-md bg-slate-950/90 text-[11px] text-slate-100 p-3 whitespace-pre-wrap">
                        {detail.unifiedDiff}
                      </pre>
                    </div>
                  )}
                  {detail.changeDetails && (
                    <div>
                      <div className="text-[11px] font-semibold text-slate-500 mb-1">
                        Change operations (JSON)
                      </div>
                      <pre className="max-h-40 overflow-auto rounded-md bg-slate-950/90 text-[11px] text-slate-100 p-3 whitespace-pre-wrap">
                        {detail.changeDetails}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

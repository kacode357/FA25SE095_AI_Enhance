// app/student/courses/[id]/reports/components/ReportTimeline.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, Loader2, Activity, AlertCircle } from "lucide-react";

import { useGetReportTimeline } from "@/hooks/reports/useGetReportTimeline";
import type { ReportTimelineItem } from "@/types/reports/reports.response";
import type { GetReportTimelinePayload } from "@/types/reports/reports.payload";

/** format datetime dùng chung */
const dt = (s?: string | null) => {
  if (!s) return "";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s || "";
  return d.toLocaleString("en-GB");
};

type Props = {
  reportId: string;
  className?: string;
  /** Nếu sau này BE có phân trang thì truyền page/pageSize vào đây */
  payloadOverrides?: Partial<GetReportTimelinePayload>;
};

export default function ReportTimeline({
  reportId,
  className = "",
  payloadOverrides,
}: Props) {
  const { getReportTimeline, loading } = useGetReportTimeline();
  const [items, setItems] = useState<ReportTimelineItem[]>([]);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Dùng key stable cho dependency thay vì object payloadOverrides
   * để tránh re-run liên tục do reference thay đổi.
   */
  const payloadKey = useMemo(
    () => JSON.stringify(payloadOverrides || {}),
    [payloadOverrides]
  );

  useEffect(() => {
    if (!reportId) return;

    let mounted = true;

    (async () => {
      setError(null);
      setInitialLoaded(false);

      const basePayload: GetReportTimelinePayload = {
        reportId,
      } as GetReportTimelinePayload;

      const payload: GetReportTimelinePayload = {
        ...basePayload,
        ...(payloadOverrides || {}),
      };

      const res = await getReportTimeline(payload);
      if (!mounted) return;

      if (res && Array.isArray(res.timeline)) {
        setItems(res.timeline);
      } else if (!res) {
        setError("Failed to load timeline.");
      }
      setInitialLoaded(true);
    })();

    return () => {
      mounted = false;
    };

    // ❗ Không để getReportTimeline vào deps để tránh loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId, payloadKey]);

  return (
    <div
      className={`card rounded-2xl p-4 border border-slate-200 bg-white ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-nav-active" />
          <h2 className="text-base font-semibold text-nav">
            Report Activity Timeline
          </h2>
        </div>
        {loading && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Loading…</span>
          </div>
        )}
      </div>

      {/* Body */}
      {!initialLoaded && loading && (
        <div className="py-6 flex items-center justify-center text-sm text-slate-500">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Loading timeline…
        </div>
      )}

      {initialLoaded && error && (
        <div className="py-4 flex items-center gap-2 text-sm text-rose-600">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {initialLoaded && !error && items.length === 0 && (
        <div className="py-4 text-sm text-slate-500">
          No timeline activity yet.
        </div>
      )}

      {initialLoaded && !error && items.length > 0 && (
        <ol className="relative border-l border-slate-200 pl-4 space-y-4">
          {items.map((item, idx) => (
            <li key={`${item.timestamp}-${idx}`} className="ml-1">
              {/* Dot */}
              <span className="absolute -left-[7px] flex h-3 w-3 items-center justify-center">
                <span className="h-2 w-2 rounded-full bg-nav-active" />
              </span>

              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-semibold text-nav">
                    {item.action || "Activity"}
                  </span>
                  <span className="text-xs text-slate-500">
                    v{item.version}
                  </span>
                </div>

                <div className="text-xs text-slate-600">
                  <span className="font-medium">
                    {item.actor || "Unknown user"}
                  </span>
                  {item.details && (
                    <>
                      {" "}
                      • <span>{item.details}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>{dt(item.timestamp)}</span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

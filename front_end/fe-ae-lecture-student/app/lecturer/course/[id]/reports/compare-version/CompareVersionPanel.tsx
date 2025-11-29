"use client";

import { useCompareReportVersions } from '@/hooks/reports/useCompareReportVersions';
import { useState } from 'react';

interface Props {
  reportId: string;
  availableVersions: number[];
  // optional callback to notify parent when a compare result is available (or cleared)
  onResult?: (res: any | null) => void;
}

export default function CompareVersionPanel({ reportId, availableVersions, onResult }: Props) {
  const { compareReportVersions, loading: loadingCompare } = useCompareReportVersions();
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState<number[]>([]);
  // This component is now responsible only for selecting versions and triggering compare.
  // The actual compare result will be rendered by the parent via onResult.

  return (
    <div className="relative text-center">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="ml-5 mb-2 px-3 cursor-pointer font-bold shadow-lg py-3 rounded-md bg-violet-50 text-sm text-violet-800 hover:bg-slate-50"
      >
        Compare 2 versions
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded shadow-2xl z-40">
          <div className="p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Select 2 Versions</div>
              <button aria-label="Close" onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="mt-3 max-h-40 overflow-auto">
              {availableVersions.length === 0 ? (
                <div className="text-sm text-slate-500">No versions available</div>
              ) : (
                <div className="space-y-2">
                  {availableVersions.map((v) => {
                    const checked = selection.includes(v as number);
                    const disabled = !checked && selection.length >= 2;
                    return (
                      <label key={v} className={`flex items-center gap-2 p-2 rounded hover:bg-slate-50 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disabled}
                          onChange={() => {
                            setSelection((prev) => {
                              if (prev.includes(v as number)) return prev.filter((x) => x !== v);
                              if (prev.length >= 2) return prev;
                              return [...prev, v as number].sort((a, b) => a - b);
                            });
                          }}
                        />
                        <span className="text-sm">Version {v}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-slate-500">Selected: {selection.length}/2</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setSelection([]); onResult?.(null); }}
                  className="text-sm cursor-pointer text-slate-600 px-2 py-1 hover:bg-slate-50 rounded"
                >
                  Reset
                </button>
                <button
                  type="button"
                  disabled={selection.length !== 2 || loadingCompare}
                  onClick={async () => {
                    if (selection.length !== 2) return;
                    onResult?.(null);
                    try {
                      const v1 = selection[0];
                      const v2 = selection[1];
                      const res = await compareReportVersions({ reportId, version1: v1, version2: v2 });

                      const mapAggregated = (agg: any) => {
                        if (!agg) return null;
                        return {
                          version: agg.version,
                          fullVersion: agg.fullVersionRange ?? undefined,
                          content: agg.finalContent ?? null,
                          status: agg.finalStatus ?? null,
                          changedBy: null,
                          changedAt: agg.lastChangeAt ?? null,
                          action: Array.isArray(agg.actionsPerformed) && agg.actionsPerformed.length > 0 ? agg.actionsPerformed[agg.actionsPerformed.length - 1] : null,
                          contributorNames: Array.isArray(agg.contributors) ? agg.contributors : [],
                        };
                      };

                      const normalized = {
                        ...(res ?? {}),
                        version1: (res && res.version1) ? res.version1 : mapAggregated(res?.aggregatedVersion1),
                        version2: (res && res.version2) ? res.version2 : mapAggregated(res?.aggregatedVersion2),
                        // ensure nullable fields are explicit
                        unifiedDiff: res?.unifiedDiff ?? null,
                        changeSummary: res?.changeSummary ?? null,
                        sequenceTimeline: res?.sequenceTimeline ?? null,
                      };

                      onResult?.(normalized ?? null);
                      setOpen(false);
                    } catch (e) {
                      // ignore
                    }
                  }}
                  className="px-3 cursor-pointer btn btn-gradient-slow text-sm py-1 bg-violet-700 text-white rounded disabled:opacity-50"
                >
                  {loadingCompare ? 'Comparing...' : 'Compare'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* No inline result here; parent renders compare outcome below header */}
    </div>
  );
}

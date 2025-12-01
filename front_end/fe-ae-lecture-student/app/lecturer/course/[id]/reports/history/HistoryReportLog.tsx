"use client";

import Select from "@/components/ui/select/Select";
import { useGetReportHistory } from "@/hooks/reports/useGetReportHistory";
import { useGetReportHistoryVersion } from "@/hooks/reports/useGetReportHistoryVersion";
import { buildHtmlWordDiff } from '@/utils/diff/htmlWordDiff';
import DOMPurify from 'dompurify';
import { Loader2, X } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import CompareVersionPanel from '../compare-version/CompareVersionPanel';
import HistoryDetails from './HistoryDetails';
import HistoryEntries from './HistoryEntries';
import HistoryVersions from './HistoryVersions';

interface Props {
  reportId: string;
}

export default function HistoryReportLog({ reportId }: Props) {
  const { getReportHistory, loading } = useGetReportHistory();
  const { getReportHistoryVersion, loading: loadingVersion } = useGetReportHistoryVersion();
  const [data, setData] = useState<any | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [selectedFullVersion, setSelectedFullVersion] = useState<string | null>(null);
  const [versionData, setVersionData] = useState<any | null>(null);
  const [compareResult, setCompareResult] = useState<any | null>(null);
  const pendingFetchRef = useRef<{ reportId: string | null; pageNumber: number | null }>({ reportId: null, pageNumber: null });

  const fetch = async (p = 1) => {
    if (!reportId) return;
    // prevent duplicate fetches for the same reportId/pageNumber when effects fire
    if (pendingFetchRef.current.reportId === reportId && pendingFetchRef.current.pageNumber === p) return;
    pendingFetchRef.current = { reportId, pageNumber: p };
    let res: any = null;
    try {
      res = await getReportHistory({ reportId, pageNumber: p, pageSize });
      if (res) setData(res);
      // derive total pages if API provides totalPages or total count
      try {
        const tp = res?.totalPages ?? (((res as any)?.total) ? Math.max(1, Math.ceil((res as any).total / pageSize)) : undefined);
        if (tp) setTotalPages(tp);
        else {
          // fallback: if returned history length is less than pageSize and we're on first page, assume 1
          const len = (res as any)?.history?.length ?? 0;
          if (p === 1 && len < pageSize) setTotalPages(1);
        }
      } catch (e) {
        // ignore
      }
    } finally {
      // clear pending marker so future requests can run
      pendingFetchRef.current = { reportId: null, pageNumber: null };
    }
  };

  const fetchVersion = async (version: number | null) => {
    setVersionData(null);
    if (!reportId || version === null) return;
    try {
      const res = await getReportHistoryVersion({ reportId, version });
      if (res) setVersionData(res);
    } catch (e) {
    }
  };

  useEffect(() => {
    if (compareResult) return;
    fetch(pageNumber);
  }, [reportId, pageNumber]);

  useEffect(() => {
    setPageNumber(1);
  }, [reportId]);



  const history: any[] = data?.history ?? [];

  const versionsList = useMemo(() => {
    const arr = Array.isArray(history) ? [...history] : [];
    arr.sort((a, b) => {
      const ta = a?.changedAt ? new Date(a.changedAt).getTime() : 0;
      const tb = b?.changedAt ? new Date(b.changedAt).getTime() : 0;
      return tb - ta;
    });

    const map = new Map<string, any>();
    for (const h of arr) {
      const key = h?.fullVersion ?? (h?.version != null ? String(h.version) : String(h?.id ?? Math.random()));
      if (!map.has(key)) map.set(key, h);
    }

    return Array.from(map.values());
  }, [history]);

  useEffect(() => {
    if (compareResult) return;
    if ((!selectedFullVersion && selectedVersion == null) && versionsList && versionsList.length > 0) {
      const first = versionsList[0];
      const num = typeof first.version === 'number' ? first.version : (typeof first.version === 'string' && /^\d+$/.test(first.version) ? Number(first.version) : null);
      setSelectedFullVersion(first.fullVersion ?? null);
      setSelectedVersion(num);
      if (num !== null) fetchVersion(num);
    }
  }, [versionsList, compareResult]);

  const displayHistory = selectedFullVersion !== null
    ? history.filter((h) => (h.fullVersion ?? null) === selectedFullVersion)
    : (selectedVersion !== null
      ? history.filter((h) => {
        const v = typeof h.version === 'number' ? h.version : (typeof h.version === 'string' && /^\d+$/.test(h.version) ? Number(h.version) : null);
        return v === selectedVersion;
      })
      : history);

  const availableVersions = Array.from(new Set(history.map((h) => {
    if (typeof h.version === 'number') return h.version;
    if (typeof h.version === 'string' && /^\d+$/.test(h.version)) return Number(h.version);
    return null;
  }).filter(Boolean))).sort((a, b) => (b as number) - (a as number));

  const renderColoredDiff = (input: any, wrapperClass = '') => {
    if (input === null || input === undefined || input === '') return <div className="text-sm text-slate-600 mt-2">—</div>;
    const text = typeof input === 'string' ? input : (typeof input === 'object' ? JSON.stringify(input, null, 2) : String(input));
    const trimmedText = text.trim();
    if (trimmedText === 'null') return <div className="text-sm text-slate-600 mt-2">—</div>;
    const lines = text.split(/\r?\n/);
    return (
      <div className={`font-mono text-[13px] whitespace-pre-wrap ${wrapperClass}`}>
        {lines.map((line, idx) => {
          const parts = line.split(/(\+[0-9A-Za-z_\-]+|\-[0-9A-Za-z_\-]+)/g);
          return (
            <div key={idx} className="leading-6">
              {parts.map((part, i) => {
                if (!part) return null;
                if (part.startsWith('+')) return <span key={i} className="text-emerald-700">{part}</span>;
                if (part.startsWith('-')) return <span key={i} className="text-red-600">{part}</span>;
                return <span key={i} className="text-slate-700">{part}</span>;
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex h-full gap-6">
      <React.Suspense>
      </React.Suspense>
      {!compareResult && (
        <HistoryVersions
          versionsList={versionsList}
          pageNumber={pageNumber}
          setPageNumber={setPageNumber}
          pageSize={pageSize}
          totalPages={totalPages}
          selectedVersion={selectedVersion}
          selectedFullVersion={selectedFullVersion}
          setSelectedVersion={setSelectedVersion}
          setSelectedFullVersion={setSelectedFullVersion}
          fetchVersion={fetchVersion}
          currentVersion={data?.currentVersion ?? null}
        />
      )}

      <div className="flex-1 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">History Log</h3>
          <div className="flex items-center gap-3">
            {!compareResult && (
              <>
                <label htmlFor="version-select" className="text-xs text-slate-500">Version</label>
                <div className="min-w-[120px]">
                  <Select<number>
                    value={selectedVersion ?? ""}
                    options={availableVersions.map((v) => ({ value: v as number, label: `Version ${v}` }))}
                    placeholder="Latest"
                    onChange={(v) => { setSelectedFullVersion(null); setSelectedVersion(v); fetchVersion(v); }}
                    className="w-full"
                  />
                </div>
                {loadingVersion && <Loader2 className="animate-spin w-4 h-4 text-slate-400" />}
              </>
            )}
            <CompareVersionPanel reportId={reportId} availableVersions={availableVersions} onResult={(r) => setCompareResult(r)} />
          </div>
        </div>

        {(selectedVersion !== null || selectedFullVersion !== null) && !compareResult && (
          <HistoryDetails
            versionData={versionData}
            loadingVersion={loadingVersion}
            selectedVersion={selectedVersion}
            selectedFullVersion={selectedFullVersion}
          />
        )}

        {compareResult && (
          <div className="mb-6 p-4 bg-white border border-slate-100 rounded shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Compare Result</h4>
              <div className="text-xs text-slate-500 mr-3">Mode: <span className="font-medium">{compareResult.mode ?? '—'}</span></div>

              <div className="flex items-center gap-2">
                <button onClick={() => setCompareResult(null)} className="text-slate-500 flex items-center gap-1 shadow-md rounded-lg border-slate-400 border py-1 px-2 cursor-pointer hover:text-slate-700"><X className="size-4" />Close</button>
              </div>
            </div>

            <div className="flex mt-5 items-center justify-between">
              <div className=" flex gap-2 items-center">
                <div className="text-xs text-slate-500">Change Summary:</div>
                {renderColoredDiff(compareResult.changeSummary ?? '—', 'text-sm whitespace-pre-wrap break-words max-h-28 overflow-auto bg-white rounded')}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-slate-500">Contributors:</div>
                <div className="text-sm">{(compareResult?.contributorNames && compareResult.contributorNames.join(', ')) ?? '—'}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Aggregated Version 1 */}
              <div className="p-3 border rounded border-slate-100 bg-slate-50">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs text-slate-500">Aggregated Version 1</div>
                    <div className="mt-2 font-mono text-sm">{compareResult.aggregatedVersion1 ? `v${compareResult.aggregatedVersion1.version} ${compareResult.aggregatedVersion1.fullVersionRange ? `(${compareResult.aggregatedVersion1.fullVersionRange})` : ''}` : '—'}</div>
                    <div className="text-xs text-slate-500 mt-1">Sequences: {compareResult.aggregatedVersion1?.sequenceCount ?? '—'}</div>
                  </div>
                  <div className="text-xs text-slate-500 text-right">
                    <div>First: {compareResult.aggregatedVersion1?.firstChangeAt ? new Date(compareResult.aggregatedVersion1.firstChangeAt).toLocaleString() : '—'}</div>
                    <div className="mt-1">Last: {compareResult.aggregatedVersion1?.lastChangeAt ? new Date(compareResult.aggregatedVersion1.lastChangeAt).toLocaleString() : '—'}</div>
                  </div>
                </div>
              </div>

              {/* Aggregated Version 2 */}
              <div className="p-3 border rounded border-slate-100 bg-slate-50">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs text-slate-500">Aggregated Version 2</div>
                    <div className="mt-2 font-mono text-sm">{compareResult.aggregatedVersion2 ? `v${compareResult.aggregatedVersion2.version} ${compareResult.aggregatedVersion2.fullVersionRange ? `(${compareResult.aggregatedVersion2.fullVersionRange})` : ''}` : '—'}</div>
                    <div className="text-xs text-slate-500 mt-1">Sequences: {compareResult.aggregatedVersion2?.sequenceCount ?? '—'}</div>
                  </div>
                  <div className="text-xs text-slate-500 text-right">
                    <div>First: {compareResult.aggregatedVersion2?.firstChangeAt ? new Date(compareResult.aggregatedVersion2.firstChangeAt).toLocaleString() : '—'}</div>
                    <div className="mt-1">Last: {compareResult.aggregatedVersion2?.lastChangeAt ? new Date(compareResult.aggregatedVersion2.lastChangeAt).toLocaleString() : '—'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs text-slate-500">Differences</div>
              {compareResult.differences && compareResult.differences.length > 0 ? (
                <div className="mt-2 space-y-2">
                  {compareResult.differences.map((d: any) => {
                    const isSubmission = String(d.field).toLowerCase() === 'submission';
                    return (
                      <div key={d.field} className="p-3 border rounded border-white bg-white">
                        <div className="flex items-start justify-between">
                          <div className="font-mono text-blue-500 text-sm">{d.field}</div>
                          <div className={`text-[11px] font-semibold flex items-center justify-center px-2 py-1 rounded ${d.changed ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 bg-slate-100'}`}>
                            {d.changed ? 'Changed' : 'Unchanged'}
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                          <div>
                            <div className="text-xs text-slate-500">Old</div>
                            {isSubmission ? (
                              (() => {
                                const oldRaw = typeof d.oldValue === 'string' ? d.oldValue : String(d.oldValue ?? '');
                                const newRaw = typeof d.newValue === 'string' ? d.newValue : String(d.newValue ?? '');

                                let renderedOld = oldRaw ? DOMPurify.sanitize(oldRaw) : '—';
                                let renderedNew = newRaw ? DOMPurify.sanitize(newRaw) : '—';

                                if (oldRaw && newRaw) {
                                  const { oldHighlighted, newHighlighted } = buildHtmlWordDiff(oldRaw, newRaw);
                                  renderedOld = DOMPurify.sanitize(oldHighlighted);
                                  renderedNew = DOMPurify.sanitize(newHighlighted);
                                }

                                return (
                                  <div className="mt-1 bg-white p-3 border border-slate-200 rounded-lg min-h-[160px] max-h-[60vh] h-full flex flex-col">
                                    <div className="overflow-auto prose max-w-full">
                                      <div className="whitespace-pre-wrap text-sm text-slate-700" dangerouslySetInnerHTML={{ __html: renderedOld }} />
                                    </div>
                                  </div>
                                );
                              })()
                            ) : (
                              <div className="mt-1 bg-white text-[12px] p-2 overflow-auto max-h-36 border border-slate-200 rounded-lg min-h-12">{renderColoredDiff(typeof d.oldValue === 'string' ? d.oldValue : JSON.stringify(d.oldValue, null, 2))}</div>
                            )}
                          </div>
                          <div>
                            <div className="text-xs text-slate-500">New</div>
                            {isSubmission ? (
                              (() => {
                                const oldRaw = typeof d.oldValue === 'string' ? d.oldValue : String(d.oldValue ?? '');
                                const newRaw = typeof d.newValue === 'string' ? d.newValue : String(d.newValue ?? '');

                                let renderedOld = oldRaw ? DOMPurify.sanitize(oldRaw) : '—';
                                let renderedNew = newRaw ? DOMPurify.sanitize(newRaw) : '—';

                                if (oldRaw && newRaw) {
                                  const { oldHighlighted, newHighlighted } = buildHtmlWordDiff(oldRaw, newRaw);
                                  renderedOld = DOMPurify.sanitize(oldHighlighted);
                                  renderedNew = DOMPurify.sanitize(newHighlighted);
                                }

                                return (
                                  <div className="mt-1 bg-white p-3 border border-slate-200 rounded-lg min-h-[160px] max-h-[60vh] h-full flex flex-col">
                                    <div className="overflow-auto prose max-w-full">
                                      <div className="whitespace-pre-wrap text-sm text-slate-700" dangerouslySetInnerHTML={{ __html: renderedNew }} />
                                    </div>
                                  </div>
                                );
                              })()
                            ) : (
                              <div className="mt-1 bg-white text-[12px] p-2 overflow-auto max-h-36 border border-slate-200 rounded-lg min-h-12">{renderColoredDiff(typeof d.newValue === 'string' ? d.newValue : JSON.stringify(d.newValue, null, 2))}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-slate-600 mt-2">—</div>
              )}
            </div>
          </div>
        )}

        {!compareResult && !loading && history.length === 0 && (
          <div className="text-sm text-slate-600">No history entries found for this report.</div>
        )}

        {!compareResult && !loading && displayHistory.length > 0 && (
          <div className="space-y-4 border-slate-200">
            <HistoryEntries displayHistory={displayHistory} renderColoredDiff={renderColoredDiff} />
          </div>
        )}

        {!compareResult && !loading && history.length > 0 && displayHistory.length === 0 && (
          <div className="text-sm text-slate-600">No history entries found for the selected version.</div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-slate-600"><Loader2 className="animate-spin" size={16} /> Loading history...</div>
        )}
      </div>
    </div>
  );
}
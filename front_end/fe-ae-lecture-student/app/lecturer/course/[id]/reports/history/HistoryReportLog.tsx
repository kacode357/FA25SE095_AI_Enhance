"use client";

import { getActionInfo } from '@/app/lecturer/course/[id]/reports/utils/actions-status';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Select from "@/components/ui/select/Select";
import { Separator } from "@/components/ui/separator";
import { useGetReportHistory } from "@/hooks/reports/useGetReportHistory";
import { useGetReportHistoryVersion } from "@/hooks/reports/useGetReportHistoryVersion";
import { ReportHistoryItem } from "@/types/reports/reports.response";
import { formatDistanceToNow, parseISO } from "date-fns";
import DOMPurify from 'dompurify';
import { Edit, Loader2, PlusCircle, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import CompareVersionPanel from '../compare-version/CompareVersionPanel';

// getActionInfo moved to hooks/reports/utils.ts for reuse across reports UI

interface Props {
  reportId: string;
}

export default function HistoryReportLog({ reportId }: Props) {
  const { getReportHistory, loading } = useGetReportHistory();
  const { getReportHistoryVersion, loading: loadingVersion } = useGetReportHistoryVersion();
  const [data, setData] = useState<any | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [versionData, setVersionData] = useState<any | null>(null);
  const [compareResult, setCompareResult] = useState<any | null>(null);
  
  const fetch = async (p = 1) => {
    if (!reportId) return;
    const res = await getReportHistory({ reportId, pageNumber: p, pageSize });
    if (res) setData(res);
  };

  const fetchVersion = async (version: number | null) => {
    setVersionData(null);
    if (!reportId || version === null) return;
    try {
      const res = await getReportHistoryVersion({ reportId, version });
      if (res) setVersionData(res);
    } catch (e) {
      // ignore, leave versionData null
    }
  };

  useEffect(() => {
    // If a compare is active, skip fetching the general history list to avoid
    // showing all versions underneath the compare result.
    if (compareResult) return;
    fetch(pageNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId, pageNumber]);

  const history: any[] = data?.history ?? [];

  const displayHistory = selectedVersion !== null
    ? history.filter((h) => {
        const v = typeof h.version === 'number' ? h.version : (typeof h.version === 'string' && /^\d+$/.test(h.version) ? Number(h.version) : null);
        return v === selectedVersion;
      })
    : history;

  const availableVersions = Array.from(new Set(history.map((h) => (typeof h.version === 'number' ? h.version : (typeof h.version === 'string' && /^\d+$/.test(h.version) ? Number(h.version) : null))).filter(Boolean))).sort((a, b) => (b as number) - (a as number));

  // reset page when reportId changes
  useEffect(() => {
    setPageNumber(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

  // no collapsed details - show everything by default

  return (
    <Card className="shadow-sm -my-6 -mx-6 py-4 border-none">
      <CardContent className="border-none -mt-3 pt-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">History Log</h3>
          </div>

          <div className="flex items-center cursor-text gap-2">
            {!compareResult && (
              <>
                <label htmlFor="version-select" className="text-xs text-slate-500">Version</label>
                <div className="min-w-[120px]">
                  <Select<number>
                    title="Version"
                    id="version-select"
                    value={selectedVersion ?? ("" as any)}
                    options={availableVersions.map((v) => ({ value: v as number, label: `Version ${v}` }))}
                    placeholder="Latest"
                    onChange={(v) => { setSelectedVersion(v as number); fetchVersion(v as number); }}
                    className="w-full"
                  />
                </div>
                {loadingVersion && <Loader2 className="animate-spin w-4 h-4 text-slate-400" />}
              </>
            )}
            <CompareVersionPanel reportId={reportId} availableVersions={availableVersions} onResult={(r) => setCompareResult(r)} />
          </div>
        </div>

        {/* If a specific version is selected, show its fetched details (hidden while comparing) */}
        {selectedVersion !== null && !compareResult && (
          <div className="mb-4 p-3 bg-slate-50 border border-slate-100 rounded">
            <div className="flex items-center justify-between">
              <div className="text-sm font-normal">Details for version <span className="font-bold text-violet-800">{selectedVersion}</span></div>
              <div className="text-xs text-slate-500">{loadingVersion ? 'Loading...' : (versionData ? 'Fetched' : 'Not available')}</div>
            </div>

            {versionData && (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500">Old changed</div>
                  {/* Try common fields for old content, fall back to changeDetails or dash */}
                  <div className="mt-1 bg-white p-3 rounded-md border border-slate-200 text-sm overflow-auto prose max-w-full h-40" dangerouslySetInnerHTML={{ __html: typeof versionData.old === 'string' ? DOMPurify.sanitize(versionData.old) : (typeof versionData.before === 'string' ? DOMPurify.sanitize(versionData.before) : (typeof versionData.previous === 'string' ? DOMPurify.sanitize(versionData.previous) : (versionData.changeDetailsOld ? DOMPurify.sanitize(String(versionData.changeDetailsOld)) : (versionData.changeDetails ? DOMPurify.sanitize(String(versionData.changeDetails)) : '—')))) }} />
                </div>
                <div>
                  <div className="text-xs text-slate-500">New changed</div>
                  {/* Try common fields for new content, fall back to unifiedDiff or dash */}
                  <div className="mt-1 bg-white p-3 rounded-md border border-slate-200 text-sm overflow-auto prose max-w-full h-40" dangerouslySetInnerHTML={{ __html: typeof versionData.new === 'string' ? DOMPurify.sanitize(versionData.new) : (typeof versionData.after === 'string' ? DOMPurify.sanitize(versionData.after) : (typeof versionData.current === 'string' ? DOMPurify.sanitize(versionData.current) : (versionData.changeDetailsNew ? DOMPurify.sanitize(String(versionData.changeDetailsNew)) : (versionData.unifiedDiff ? DOMPurify.sanitize(String(versionData.unifiedDiff)) : '—')))) }} />
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Compare result rendered below header so the header layout stays intact */}
        {compareResult && (
          <div className="mb-6 p-4 bg-white border border-slate-100 rounded shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold">Compare Result</h4>
              </div>
              <div>
                <button onClick={() => setCompareResult(null)} className="text-slate-500 cursor-pointer hover:text-slate-700">Close ✕</button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 border rounded border-slate-100 bg-slate-50">
                <div className="text-xs text-slate-500">Version {compareResult.version1?.version ?? '—'}</div>
                <div className="mt-2 text-sm font-mono text-slate-700">{compareResult.version1?.content ?? '—'}</div>
                <div className="mt-3 text-xs text-slate-500">Status</div>
                <div className="text-sm">{compareResult.version1?.status ?? '—'}</div>
                <div className="mt-3 text-xs text-slate-500">Action</div>
                <div className="text-sm">{compareResult.version1?.action ?? '—'}</div>
                <div className="mt-3 text-xs text-slate-500">Changed By</div>
                <div className="text-sm">{compareResult.version1?.changedBy ?? '—'}</div>
                <div className="mt-2 text-xs text-slate-500">Changed At</div>
                <div className="text-sm">{compareResult.version1?.changedAt ?? '—'}</div>
              </div>

              <div className="p-3 border rounded border-slate-100 bg-slate-50">
                <div className="text-xs text-slate-500">Version {compareResult.version2?.version ?? '—'}</div>
                <div className="mt-2 text-sm font-mono text-slate-700">{compareResult.version2?.content ?? '—'}</div>
                <div className="mt-3 text-xs text-slate-500">Status</div>
                <div className="text-sm">{compareResult.version2?.status ?? '—'}</div>
                <div className="mt-3 text-xs text-slate-500">Action</div>
                <div className="text-sm">{compareResult.version2?.action ?? '—'}</div>
                <div className="mt-3 text-xs text-slate-500">Changed By</div>
                <div className="text-sm">{compareResult.version2?.changedBy ?? '—'}</div>
                <div className="mt-2 text-xs text-slate-500">Changed At</div>
                <div className="text-sm">{compareResult.version2?.changedAt ?? '—'}</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs text-slate-500">Change Summary</div>
              <div className="mt-1 text-sm text-slate-700 whitespace-pre-wrap break-words max-h-40 overflow-auto p-2 bg-white rounded">{compareResult.changeSummary ?? '—'}</div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-500">Differences</div>
                {compareResult.differences && compareResult.differences.length > 0 ? (
                  <div className="mt-2 space-y-3">
                    {compareResult.differences.map((d: any) => (
                      <div key={d.field} className="p-3 border rounded border-slate-200 bg-slate-50">
                        <div className="flex items-center justify-between">
                          <div className="font-mono text-sm">{d.field}</div>
                          <div className={`text-[11px] font-semibold ${d.changed ? 'text-emerald-700' : 'text-slate-500'}`}>{d.changed ? 'Changed' : 'Unchanged'}</div>
                        </div>
                        <div className="mt-2 grid grid-cols-1 gap-3">
                          <div>
                            <div className="text-xs text-slate-500">Old</div>
                            <pre className="mt-1 bg-white text-[12px] p-2 rounded overflow-auto max-h-48 border"><code>{JSON.stringify(d.oldValue, null, 2)}</code></pre>
                          </div>
                          <div>
                            <div className="text-xs text-slate-500">New</div>
                            <pre className="mt-1 bg-white text-[12px] p-2 rounded overflow-auto max-h-48 border"><code>{JSON.stringify(d.newValue, null, 2)}</code></pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-600 mt-2">—</div>
                )}
              </div>

              <div>
                <div className="text-xs text-slate-500">Unified Diff</div>
                {compareResult.unifiedDiff ? (
                  <div className="mt-2 h-48 border border-slate-200 rounded overflow-hidden bg-white">
                    <ScrollArea className="h-full">
                      <pre className="p-3 text-[13px] whitespace-pre-wrap"><code>{DOMPurify.sanitize(String(compareResult.unifiedDiff))}</code></pre>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="text-sm text-slate-600 mt-2">—</div>
                )}
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-500">Contributors</div>
            <div className="text-sm">{(compareResult?.contributorNames && compareResult.contributorNames.join(', ')) ?? '—'}</div>

            <div className="mt-3 text-right">
              <button
                className="text-sm cursor-pointer btn btn-gradient-slow text-slate-600 hover:text-slate-800"
                onClick={() => setCompareResult(null)}
              >
                Clear compare
              </button>
            </div>
          </div>
        )}
        
        {/* When comparing, hide the history list and pagination below; the compare panel
            itself displays the compare response. */}
        {!compareResult && !loading && history.length === 0 && (
          <div className="text-sm text-slate-600">No history entries found for this report.</div>
        )}

        {!compareResult && !loading && displayHistory.length > 0 && (
          <div className="space-y-4 border-slate-200">
            {displayHistory.map((h) => (
              <article key={h.id} className="border rounded-lg bg-white border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {/* Styled action pill with icon */}
                      {(() => {
                        const entry = h as ReportHistoryItem;
                        const info = getActionInfo(entry.action);
                        const key = info.key;
                        const label = info.label;
                        const colorClass = key === 'updated' ? ' bg-blue-50 text-blue-700' : key === 'created' ? 'bg-emerald-50 text-emerald-700' : key === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-700';
                        return (
                          <div role="status" aria-label={label} className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${colorClass} border border-slate-100 shadow-sm`}>
                            <span className="w-4 h-4 flex items-center justify-center">
                              {key === 'updated' ? <Edit className="w-3 h-3" /> : key === 'created' ? <PlusCircle className="w-3 h-3" /> : key === 'rejected' ? <Trash2 className="w-3 h-3" /> : <RefreshCw className="w-3 h-3" />}
                            </span>
                            <span>{label}</span>
                          </div>
                        );
                      })()}

                      {/* Show contributor names (readable) — fall back to changedBy if names not available */}
                      <div className="text-sm font-medium">{(h.contributorNames && Array.isArray(h.contributorNames) && h.contributorNames.length > 0) ? `${h.contributorNames.join(', ')}` : (h.changedBy ?? '—')}</div>
                      <div className="text-xs text-slate-400">{h.changedAt ? `${new Date(h.changedAt).toLocaleString()} • ${formatDistanceToNow(parseISO(h.changedAt), { addSuffix: true })}` : '—'}</div>
                    </div>

                    <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                      <div className="col-span-1">
                        <div className="text-xs text-slate-500">ID</div>
                        <div className="font-mono text-sm">{h.id ?? '—'}</div>
                        <div className="text-xs text-slate-500 mt-3">Report</div>
                        <div className="font-mono text-sm">{h.reportId ?? reportId}</div>
                      </div>

                      <div className="col-span-1">
                        <div className="text-xs text-slate-500">Version</div>
                        <div className="font-medium">{typeof h.version === 'number' ? h.version : '—'}</div>
                        <div className="text-xs text-slate-500 mt-3">Contributors</div>
                        <div className="text-sm font-mono text-slate-700">{(h.contributorNames && Array.isArray(h.contributorNames) && h.contributorNames.length > 0) ? h.contributorNames.join(', ') : '—'}</div>
                      </div>

                      <div className="col-span-1">
                        <div className="text-xs text-slate-500">Comment</div>
                        <div className="text-sm text-slate-700 whitespace-pre-wrap">{h.comment ?? '—'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="w-36 text-right">
                    <div className="text-xs text-slate-500">Changed At</div>
                    <div className="text-sm text-slate-700">{h.changedAt ? formatDistanceToNow(parseISO(h.changedAt), { addSuffix: true }) : '—'}</div>
                  </div>
                </div>

                <Separator />

                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-slate-500">Change Summary</div>
                      <div className="text-sm text-slate-700 whitespace-pre-wrap break-words max-h-40 overflow-auto mt-2 p-2 bg-white rounded">{h.changeSummary ?? '—'}</div>

                      <div className="text-xs text-slate-500 mt-7">Change Details</div>
                      <div className="text-sm text-slate-700 whitespace-pre-wrap break-words max-h-40 overflow-auto mt-2 p-2 bg-white rounded">{h.changeDetails ?? '—'}</div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500">Unified Diff</div>
                      {h.unifiedDiff ? (
                        <div className="mt-1 h-40 border border-slate-200 rounded bg-slate-50 overflow-hidden">
                          <ScrollArea className="h-full border-slate-200">
                            <pre className="p-3 text-[13px] whitespace-pre-wrap"><code>{h.unifiedDiff}</code></pre>
                          </ScrollArea>
                        </div>
                      ) : (
                        <div className="text-sm text-slate-600 mt-1">—</div>
                      )}
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="text-xs text-slate-500">Field Changes</div>
                    {h.changes && Object.keys(h.changes).length > 0 ? (
                      <div className="mt-2 grid gap-2">
                        {Object.entries(h.changes).map(([key, val]) => (
                          <div key={key} className="p-3 border rounded border-slate-200 bg-white">
                            <div className="mb-2">
                              <div className="font-mono text-sm">{key}</div>
                            </div>

                            {/* If change value is an object with old/new, render them cleanly */}
                            {val && typeof val === 'object' && (('old' in val) || ('new' in val)) ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <div className="text-xs text-slate-500">Old changed</div>
                                  {/* sanitize HTML before rendering to avoid XSS */}
                                  <div className="mt-1 bg-slate-50 p-3 rounded text-sm overflow-auto prose max-w-full" dangerouslySetInnerHTML={{ __html: typeof (val as any).old === 'string' ? DOMPurify.sanitize((val as any).old) : String((val as any).old ?? '—') }} />
                                </div>

                                <div>
                                  <div className="text-xs text-slate-500">New changed</div>
                                  {/* sanitize HTML before rendering to avoid XSS */}
                                  <div className="mt-1 bg-slate-50 p-3 rounded text-sm overflow-auto prose max-w-full" dangerouslySetInnerHTML={{ __html: typeof (val as any).new === 'string' ? DOMPurify.sanitize((val as any).new) : String((val as any).new ?? '—') }} />
                                </div>
                              </div>
                            ) : typeof val === 'string' ? (
                              <div>
                                <div className="text-xs text-slate-500">Value</div>
                                <pre className="mt-1 bg-slate-50 text-[13px] p-2 rounded overflow-auto"><code>{val}</code></pre>
                              </div>
                            ) : (
                              <div>
                                <div className="text-xs text-slate-500">Value</div>
                                <pre className="mt-1 bg-slate-50 text-[13px] p-2 rounded overflow-auto"><code>{JSON.stringify(val, null, 2)}</code></pre>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-slate-600">—</div>
                    )}
                  </div>

                </div>
              </article>
            ))}
          </div>
        )}

        {/* If a version is selected but there are no entries for it, show a helpful message */}
        {!compareResult && !loading && history.length > 0 && displayHistory.length === 0 && (
          <div className="text-sm text-slate-600">No history entries found for the selected version.</div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-slate-600"><Loader2 className="animate-spin" size={16} /> Loading history...</div>
        )}

        {/* Pagination footer (hidden while compare is active) */}
        {!compareResult && (
          <div className="mt-6 border-t border-slate-200 pt-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="text-sm text-slate-600">Page <span className="font-medium text-slate-800">{data?.pageNumber ?? pageNumber}</span> / <span className="text-slate-500">{data?.totalPages ?? 1}</span></div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={pageNumber <= 1 || loading} onClick={() => setPageNumber((p) => Math.max(1, p - 1))}>Previous</Button>
              <span>/</span>
              <Button size="sm" variant="outline" disabled={loading || (data && !data.hasNext)} onClick={() => setPageNumber((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

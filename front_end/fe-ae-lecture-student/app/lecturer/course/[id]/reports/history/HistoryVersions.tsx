"use client";
import { getActionInfo } from '@/app/lecturer/course/[id]/reports/utils/actions-status';
import { STATUS_MAP } from '@/app/lecturer/course/[id]/reports/utils/status';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TimerReset } from "lucide-react";
import React from 'react';

interface Props {
    versionsList: any[];
    pageNumber: number;
    setPageNumber: React.Dispatch<React.SetStateAction<number>>;
    pageSize: number;
    totalPages: number;
    selectedVersion: number | null;
    selectedFullVersion: string | null;
    setSelectedVersion: (v: number | null) => void;
    setSelectedFullVersion: (v: string | null) => void;
    fetchVersion: (v: number | null) => Promise<void>;
    currentVersion?: number | string | null;
}

export default function HistoryVersions({
    versionsList,
    pageNumber,
    setPageNumber,
    pageSize,
    totalPages,
    selectedVersion,
    selectedFullVersion,
    setSelectedVersion,
    setSelectedFullVersion,
    fetchVersion,
    currentVersion,
}: Props) {
    return (
        <div className="w-96 flex flex-col">
            <Card className="flex-1 py-0 gap-0 flex flex-col border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex flex-col items-baseline gap-3">
                        <h3 className="text-sm font-semibold">Versions</h3>
                        {currentVersion != null && (
                            <div className="text-xs text-green-700">Current: <span className="font-medium bg-green-600 py-1 px-2 rounded-sm text-white">{typeof currentVersion === 'number' ? `v${currentVersion}` : String(currentVersion)}</span></div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                            disabled={pageNumber <= 1}
                            aria-label="Previous page"
                            className={`text-xs px-2 py-1 rounded-md border ${pageNumber <= 1 ? 'border-slate-200 text-slate-400 cursor-not-allowed' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                        >
                            Prev
                        </button>

                        <div className="text-xs text-slate-500 min-w-[64px] text-center">Page {pageNumber}/{totalPages}</div>

                        <button
                            type="button"
                            onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                            disabled={pageNumber >= totalPages}
                            aria-label="Next page"
                            className={`text-xs px-2 py-1 rounded-md border ${pageNumber >= totalPages ? 'border-slate-200 text-slate-400 cursor-not-allowed' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                        >
                            Next
                        </button>
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-3">
                        {versionsList.map((v) => {
                            const versionNumber = typeof v.version === 'number' ? v.version : (typeof v.version === 'string' && /^\d+$/.test(v.version) ? Number(v.version) : null);
                            const display = v.fullVersion ? `v${v.fullVersion}` : versionNumber !== null ? `v${versionNumber}` : '—';
                            const isSelected = selectedFullVersion ? selectedFullVersion === v.fullVersion : selectedVersion === versionNumber;
                            const action = v.action ?? v.status ?? '';
                            const info = getActionInfo(action);
                            const isCurrent = !!(v?.isCurrent || v?.isLatest || v?.current === true || v?.isCurrentVersion);
                            // Map action keys to color classes using the existing STATUS_MAP
                            const ACTION_COLOR_MAP: Record<string, string> = {
                                created: STATUS_MAP[6]?.classes ?? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
                                updated: STATUS_MAP[2]?.classes ?? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
                                submitted: STATUS_MAP[2]?.classes ?? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
                                resubmitted: STATUS_MAP[5]?.classes ?? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800',
                                graded: STATUS_MAP[6]?.classes ?? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
                                revisionrequested: STATUS_MAP[4]?.classes ?? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800',
                                rejected: STATUS_MAP[8]?.classes ?? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800',
                                statuschanged: STATUS_MAP[3]?.classes ?? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800',
                            };

                            const handleSelect = () => {
                                setSelectedFullVersion(v.fullVersion ?? null);
                                setSelectedVersion(versionNumber);
                                if (versionNumber !== null) fetchVersion(versionNumber);
                            };

                            return (
                                <div
                                    key={v.id ?? display}
                                    role="button"
                                    tabIndex={0}
                                    onClick={handleSelect}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(); } }}
                                    className={`rounded-md border overflow-hidden cursor-pointer transition-colors ${isSelected ? 'border-violet-300 bg-violet-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                                >
                                    <div className="p-3 flex items-start justify-between">
                                        <div className="min-w-0 pr-4">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    {(() => {
                                                        const actionClass = ACTION_COLOR_MAP[info.key] ?? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800';
                                                        return <div className={actionClass}>{info.label}</div>;
                                                    })()}
                                                </div>
                                                <div className="text-xs font-normal text-slate-400 truncate">
                                                    {display} {isCurrent && <span className="text-emerald-600 text-xs font-normal ml-2">(Current)</span>}
                                                </div>
                                            </div>
                                            <div className="mt-2 text-xs text-slate-500 break-words max-w-full">
                                                {Array.isArray(v.contributorNames) && v.contributorNames.length > 0 ? `By ${v.contributorNames.join(', ')}` : ''}
                                            </div>
                                            <div className="mt-2 text-xs text-violet-700 font-medium cursor-pointer hover:underline">Details &gt;</div>
                                        </div>
                                        <div className="text-xs text-slate-500 text-right whitespace-nowrap flex flex-col items-end gap-1 min-w-[72px]">
                                            <div className="flex items-center gap-1">
                                                <TimerReset className="size-3.5" />
                                                <div className="text-[11px] text-slate-400">{v.changedAt ? new Date(v.changedAt).toLocaleDateString('vi-VN') : ''}</div>
                                            </div>
                                            <div className="text-[11px]">{v.changedAt ? new Date(v.changedAt).toLocaleTimeString('vi-VN') : ''}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </Card>
        </div>
    );
}

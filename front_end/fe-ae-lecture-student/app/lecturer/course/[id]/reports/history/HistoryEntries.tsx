"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import React from 'react';

interface Props {
    displayHistory: any[];
    renderColoredDiff: (input: any, wrapperClass?: string) => React.ReactNode;
}

export default function HistoryEntries({ displayHistory, renderColoredDiff }: Props) {
    return (
        <>
            {displayHistory.map((h) => (
                <article key={h.id} className="border rounded-lg bg-white border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-4 flex items-start gap-4">
                        <div className="flex-1">
                            <div className="col-span-1">
                                <div className="text-xs text-slate-500">Comment</div>
                                <div className="text-xs text-slate-700 whitespace-pre-wrap">{h.comment ?? '—'}</div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs text-slate-500">Change Summary</div>
                                {renderColoredDiff(h.changeSummary ?? '—', 'text-sm whitespace-pre-wrap break-words max-h-40 overflow-auto mt-2 p-2 bg-white rounded')}

                                <div className="text-xs text-slate-500 mt-7">Change Details</div>
                                <div className="text-sm text-slate-700 whitespace-pre-wrap break-words max-h-40 overflow-auto mt-2 p-2 bg-white rounded">{h.changeDetails ?? '—'}</div>
                            </div>

                            <div>
                                <div className="text-xs text-slate-500">Unified Diff</div>
                                {h.unifiedDiff ? (
                                    <div className="mt-1 h-40 border border-slate-200 rounded bg-slate-50 overflow-hidden">
                                        <ScrollArea className="h-full border-slate-200">
                                            <div className="p-3 text-[13px]">
                                                {renderColoredDiff(h.unifiedDiff)}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                ) : (
                                    <div className="text-sm text-slate-600 mt-1">—</div>
                                )}
                            </div>
                        </div>
                    </div>
                </article>
            ))}
        </>
    );
}

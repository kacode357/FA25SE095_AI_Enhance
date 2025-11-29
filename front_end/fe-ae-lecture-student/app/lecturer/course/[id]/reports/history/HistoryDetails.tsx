"use client";
import { Separator } from "@/components/ui/separator";
import DOMPurify from 'dompurify';

interface Props {
    versionData: any | null;
    loadingVersion: boolean;
    selectedVersion: number | null;
    selectedFullVersion: string | null;
}

export default function HistoryDetails({ versionData, loadingVersion, selectedVersion, selectedFullVersion }: Props) {
    return (
        <div className="mb-4 p-3 bg-slate-50 border border-slate-100 rounded">
            <div className="flex items-center justify-between">
                <div className="text-sm font-normal">Details for version <span className="font-bold text-violet-800">{selectedFullVersion ?? selectedVersion}</span></div>
                <div className="text-xs text-slate-500">{loadingVersion ? 'Loading...' : (versionData ? 'Fetched' : 'Not available')}</div>
            </div>

            {versionData && (
                <div className="mt-3">
                    <div className="text-xs text-slate-500">CHANGED FIELDS</div>
                    <div className="mt-2 flex flex-col gap-4">
                                {/* Submission row: large before/after boxes side-by-side */}
                                <div className="p-3 border rounded border-slate-200 bg-white">
                                    <div className="text-xs text-slate-500 mb-2">Submission</div>
                                    {versionData.changes && versionData.changes.Submission ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-[13px] text-slate-500">Before</div>
                                                <div className="mt-1 bg-red-50 p-3 rounded text-sm overflow-auto prose max-w-full min-h-[160px]" dangerouslySetInnerHTML={{ __html: typeof versionData.changes.Submission.old === 'string' ? DOMPurify.sanitize(versionData.changes.Submission.old) : (versionData.changes.Submission.old == null ? '—' : DOMPurify.sanitize(String(versionData.changes.Submission.old))) }} />
                                            </div>
                                            <div>
                                                <div className="text-[13px] text-slate-500">After</div>
                                                <div className="mt-1 bg-green-50 p-3 rounded text-sm overflow-auto prose max-w-full min-h-[160px]" dangerouslySetInnerHTML={{ __html: typeof versionData.changes.Submission.new === 'string' ? DOMPurify.sanitize(versionData.changes.Submission.new) : (versionData.changes.Submission.new == null ? '—' : DOMPurify.sanitize(String(versionData.changes.Submission.new))) }} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-2 text-sm text-slate-600">Not updated yet</div>
                                    )}
                                </div>

                                {/* FilePath row */}
                                <div className="p-3 border rounded border-slate-200 bg-white">
                                    <div className="text-xs text-slate-500 mb-2">FilePath</div>
                                    {versionData.changes && (versionData.changes.FilePath || versionData.changes.FileUrl) ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                                            <div>
                                                <div className="text-[13px] text-slate-500">Before</div>
                                                <div className="mt-1 text-sm text-slate-700 bg-red-50 p-3 rounded">{(versionData.changes.FilePath?.old ?? versionData.changes.FileUrl?.old) ?? '—'}</div>
                                            </div>
                                            <div>
                                                <div className="text-[13px] text-slate-500">After</div>
                                                <div className="mt-1 text-sm text-slate-700 bg-green-50 p-3 rounded">{(versionData.changes.FilePath?.new ?? versionData.changes.FileUrl?.new) ?? '—'}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-2 text-sm text-slate-600">Not updated yet</div>
                                    )}
                                </div>

                                {/* Status row */}
                                <div className="p-3 border rounded border-slate-200 bg-white">
                                    <div className="text-xs text-slate-500 mb-2">Status</div>
                                    {versionData.changes && versionData.changes.Status ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                                            <div>
                                                <div className="text-[13px] text-slate-500">Before</div>
                                                <div className="mt-1 text-sm text-slate-700 bg-red-50 p-3 rounded">{versionData.changes.Status.old ?? '—'}</div>
                                            </div>
                                            <div>
                                                <div className="text-[13px] text-slate-500">After</div>
                                                <div className="mt-1 text-sm text-slate-700 bg-green-50 p-3 rounded">{versionData.changes.Status.new ?? '—'}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-2 text-sm text-slate-600">Not updated yet</div>
                                    )}
                                </div>
                            </div>
                </div>
            )}

            <Separator className="mt-4" />
        </div>
    );
}

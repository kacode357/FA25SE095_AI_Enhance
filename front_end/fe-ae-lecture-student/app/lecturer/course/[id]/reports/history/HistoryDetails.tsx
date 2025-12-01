"use client";
import { Separator } from "@/components/ui/separator";
import { buildHtmlWordDiff } from '@/utils/diff/htmlWordDiff';
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
                {/* <div className="text-sm font-normal">Details for version <span className="font-bold text-violet-800">{selectedFullVersion ?? selectedVersion}</span></div> */}
                {/* <div className="text-xs text-slate-500">{loadingVersion ? 'Loading...' : (versionData ? 'Fetched' : 'Not available')}</div> */}
            </div>

            {versionData && (
                <div className="">
                    <div className="flex justify-between">
                        <div className="text-xs text-slate-500">CHANGED FIELDS</div>
                        <div className="font-mono text-sm text-blue-600 mb-2">Submission</div>
                    </div>
                    <div className="mt-2 flex flex-col gap-4">
                            {versionData.changes && versionData.changes.Submission ? (
                                (() => {
                                    const oldRaw = typeof versionData.changes.Submission.old === 'string' ? versionData.changes.Submission.old : (versionData.changes.Submission.old == null ? '' : String(versionData.changes.Submission.old));
                                    const newRaw = typeof versionData.changes.Submission.new === 'string' ? versionData.changes.Submission.new : (versionData.changes.Submission.new == null ? '' : String(versionData.changes.Submission.new));

                                    let renderedOld = oldRaw ? DOMPurify.sanitize(oldRaw) : '—';
                                    let renderedNew = newRaw ? DOMPurify.sanitize(newRaw) : '—';

                                    if (oldRaw && newRaw) {
                                        const { oldHighlighted, newHighlighted } = buildHtmlWordDiff(oldRaw, newRaw);
                                        renderedOld = DOMPurify.sanitize(oldHighlighted);
                                        renderedNew = DOMPurify.sanitize(newHighlighted);
                                    }

                                    return (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                                            <div className="flex flex-col h-full">
                                                <div className="text-[13px] text-slate-500">Before</div>
                                                <div
                                                    className="mt-1 bg-white p-3 rounded-lg text-sm prose prose-sm max-w-full min-h-[160px] h-full max-h-[60vh] overflow-auto border border-slate-200 [&_h1]:text-base [&_h2]:text-base [&_h3]:text-base [&_h4]:text-base [&_h5]:text-base [&_h6]:text-base"
                                                    dangerouslySetInnerHTML={{ __html: renderedOld }}
                                                />
                                            </div>
                                            <div className="flex flex-col h-full">
                                                <div className="text-[13px] text-slate-500">After</div>
                                                <div
                                                    className="mt-1 bg-white p-3 rounded-lg text-sm prose prose-sm max-w-full min-h-[160px] h-full max-h-[60vh] overflow-auto border border-slate-200 [&_h1]:text-base [&_h2]:text-base [&_h3]:text-base [&_h4]:text-base [&_h5]:text-base [&_h6]:text-base"
                                                    dangerouslySetInnerHTML={{ __html: renderedNew }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })()
                            ) : (
                                <div className="mt-2 text-sm text-slate-600">Not updated yet</div>
                            )}
                        </div>

                        {/* FilePath row */}
                        <div className="p-3 border rounded border-slate-200 my-3 bg-white">
                            <div className="text-xs text-slate-500 mb-2">FilePath</div>
                            {versionData.changes && (versionData.changes.FilePath || versionData.changes.FileUrl) ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                                    <div className="flex flex-col h-full">
                                        <div className="text-[13px] text-slate-500">Before</div>
                                        <div className="mt-1 text-sm text-slate-700 bg-red-50 p-3 rounded h-full min-h-[80px] max-h-[40vh] overflow-auto border border-slate-200">{(versionData.changes.FilePath?.old ?? versionData.changes.FileUrl?.old) ?? '—'}</div>
                                    </div>
                                    <div className="flex flex-col h-full">
                                        <div className="text-[13px] text-slate-500">After</div>
                                        <div className="mt-1 text-sm text-slate-700 bg-green-50 p-3 rounded h-full min-h-[80px] max-h-[40vh] overflow-auto border border-emerald-200">{(versionData.changes.FilePath?.new ?? versionData.changes.FileUrl?.new) ?? '—'}</div>
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                                    <div className="flex flex-col h-full">
                                        <div className="text-[13px] text-slate-500">Before</div>
                                        <div className="mt-1 text-sm text-slate-700 bg-red-50 p-3 rounded h-full min-h-[80px] max-h-[40vh] overflow-auto border border-slate-200">{versionData.changes.Status.old ?? '—'}</div>
                                    </div>
                                    <div className="flex flex-col h-full">
                                        <div className="text-[13px] text-slate-500">After</div>
                                        <div className="mt-1 text-sm text-slate-700 bg-green-50 p-3 rounded h-full min-h-[80px] max-h-[40vh] overflow-auto border border-emerald-200">{versionData.changes.Status.new ?? '—'}</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-2 text-sm text-slate-600">Not updated yet</div>
                            )}
                        </div>
                    </div>
            )}

            <Separator className="mt-4" />
        </div>
    );
}

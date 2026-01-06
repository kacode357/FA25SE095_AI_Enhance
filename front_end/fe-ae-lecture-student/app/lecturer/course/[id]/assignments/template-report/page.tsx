"use client";

import { useTemplateDownload } from "@/hooks/template/useTemplateDownload";
import { useTemplateMetadata } from "@/hooks/template/useTemplateMetadata";
import type { TemplateItem } from "@/types/template/template.response";
import { formatToVN } from "@/utils/datetime/time";
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    CloudDownload,
    File,
    FileText,
    Info,
    Loader2,
    RotateCcw,
    XCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TemplateReportPage() {
    const router = useRouter();

    const { loading: loadingMetadata, data: metadataResponse, error: metadataError, fetch: fetchMetadata } = useTemplateMetadata();
    const { loading: downloading, download } = useTemplateDownload();

    const [template, setTemplate] = useState<TemplateItem | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const res = await fetchMetadata(true); // Fetch active template
        if (res) {
            // Handle different response types
            if (Array.isArray(res)) {
                setTemplate(res[0] || null);
            } else if ('hasActiveTemplate' in res) {
                setTemplate(res.template);
            } else {
                setTemplate(res as TemplateItem);
            }
        }
    };

    const handleDownload = async () => {
        const result = await download();
        if (!result) return;

        const url = URL.createObjectURL(result.blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.filename || `${template?.name || template?.originalFileName || "template"}.docx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const formatFileSize = (bytes?: number): string => {
        if (!bytes) return "N/A";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    return (
        <div className="min-h-screen -m-3 bg-gradient-to-br from-slate-50 via-violet-50/30 to-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 -ml-2 cursor-pointer text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
                            title="Go Back"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>

                        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-violet-100 rounded-lg">
                                <FileText className="w-5 h-5 text-violet-600" />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-lg font-bold text-slate-800">
                                    Report Template
                                </h1>
                                <p className="text-xs text-slate-500">Active template information</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={loadData}
                            disabled={loadingMetadata}
                            className="flex items-center gap-2 cursor-pointer px-4 py-2 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
                            title="Refresh"
                        >
                            <RotateCcw className={`w-4 h-4 ${loadingMetadata ? 'animate-spin' : ''}`} />
                            <span className="font-medium text-sm">Refresh</span>
                        </button>

                        {/* <button
                            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                            onClick={handleDownload}
                            disabled={downloading || !template}
                        >
                            {downloading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <CloudDownload className="w-4 h-4" />
                            )}
                            <span className="hidden sm:inline">
                                {downloading ? "Downloading..." : "Download Template"}
                            </span>
                        </button> */}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-auto pb-8 pt-6 px-4">
                <div className="max-w-5xl mx-auto">
                    {loadingMetadata && !template ? (
                        <div className="flex flex-col items-center justify-center h-96 text-slate-400 gap-3">
                            <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
                            <p className="text-sm">Loading template information...</p>
                        </div>
                    ) : metadataError ? (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Template</h3>
                            <p className="text-sm text-red-600 mb-4">{metadataError.message}</p>
                            <button
                                onClick={loadData}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : template ? (
                        <div className="space-y-6">
                            {/* Status Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-violet-100 rounded-lg">
                                            <File className="w-6 h-6 text-violet-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-800">
                                                {template.name || template.originalFileName || "Untitled Template"}
                                            </h2>
                                            {template.filename && (
                                                <p className="text-sm text-slate-500 mt-1 font-mono">
                                                    {template.filename}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {template.isActive && (
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 border border-green-200 rounded-full">
                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            <span className="text-xs font-medium text-green-700">Active</span>
                                        </div>
                                    )}
                                </div>

                                {template.description && (
                                    <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-100">
                                        <div className="flex items-start gap-2">
                                            <Info className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-slate-700">Description: {template.description}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* File Size */}
                                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FileText className="w-4 h-4 text-slate-500" />
                                            <span className="text-xs font-medium text-slate-500 uppercase">File Size</span>
                                        </div>
                                        <p className="text-lg font-semibold text-slate-800">
                                            {template.fileSizeFormatted || formatFileSize(template.fileSize)}
                                        </p>
                                    </div>

                                    {/* Uploaded Date */}
                                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar className="w-4 h-4 text-slate-500" />
                                            <span className="text-xs font-medium text-slate-500 uppercase">Uploaded</span>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            {template.uploadedAt
                                                ? formatToVN(template.uploadedAt, { dateStyle: "medium" })
                                                : "N/A"}
                                        </p>
                                        {template.uploadedAt && (
                                            <p className="text-xs text-slate-500 mt-1">
                                                {formatToVN(template.uploadedAt, { timeStyle: "medium" })}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Updated Date */}
                                {template.updatedAt && (
                                    <div className="mt-4 pt-4 border-t border-slate-200">
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>Last updated: {formatToVN(template.updatedAt, { dateStyle: "medium", timeStyle: "short" })}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Template ID Card */}
                            {/* <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-200 p-6">
                                <div className="flex items-center justify-between">
                                    {template.type && (
                                        <div className="px-3 py-1.5 bg-white/70 border border-violet-200 rounded-lg">
                                            <span className="text-sm font-medium text-violet-700">{template.type}</span>
                                        </div>
                                    )}
                                </div>
                            </div> */}

                            {/* Download Action Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-800 mb-1">
                                            Download Template
                                        </h3>
                                        <p className="text-sm text-slate-600">
                                            Click the button to download this template.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleDownload}
                                        disabled={downloading}
                                        className="flex items-center btn btn-gradient-slow gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg shadow-sm transition-all hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
                                    >
                                        {downloading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Downloading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CloudDownload className="w-5 h-5" />
                                                <span>Download Now</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center">
                            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Template Found</h3>
                            <p className="text-sm text-slate-500 mb-6">
                                There is no active template available at the moment.
                            </p>
                            <button
                                onClick={loadData}
                                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm transition-colors"
                            >
                                Refresh
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
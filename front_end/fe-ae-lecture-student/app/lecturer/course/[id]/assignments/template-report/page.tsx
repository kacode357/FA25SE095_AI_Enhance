"use client";

import { useTemplateReportDownload } from "@/hooks/template/useTemplateReportDownload";
import { useTemplateReportPreview } from "@/hooks/template/useTemplateReportPreview";
import { format } from "date-fns";
import {
    ArrowLeft,
    Calendar,
    CloudDownload,
    ExternalLink,
    FileText,
    Loader2,
    RotateCcw
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function TemplateReportPage() {
    const router = useRouter();
    const search = useSearchParams();
    // eslint-disable-next-line no-unused-vars
    const courseId = search?.get?.("id") || undefined;

    const { getReportPreview, loading: loadingPreview } = useTemplateReportPreview();
    const { downloadTemplate, loading: downloading } = useTemplateReportDownload();

    const [data, setData] = useState<any | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const previewRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const res = await getReportPreview();
        if (res) setData(res);
    };

    const handleDownload = async () => {
        const blob = await downloadTemplate();
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${data?.templateName ?? "report-template"}.docx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const handleOpenNew = () => {
        if (!data) return;

        const popup = window.open("", "_blank");
        if (!popup) return;

        const pageTitle = data.templateName
            ? `${data.templateName} Template`
            : "DIGITAL MARKETING RESEARCH REPORT Template";

        popup.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${pageTitle}</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    /* Reset cơ bản để trang popup nhìn giống trang giấy */
                    body { 
                        background-color: #f1f5f9; /* slate-100 */
                        display: flex;
                        justify-content: center;
                        padding: 40px 0;
                        margin: 0;
                        font-family: ui-sans-serif, system-ui, sans-serif;
                    }
                    .paper {
                        background-color: white;
                        width: 210mm; /* Khổ A4 */
                        min-height: 297mm;
                        padding: 20mm;
                        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
                    }
                    /* Style cho nội dung văn bản (nếu cần) */
                    .paper * { max-width: 100%; }
                </style>
            </head>
            <body>
                <div class="paper">
                    ${data.htmlContent || ""}
                </div>
            </body>
            </html>
        `);

        popup.document.close(); // Quan trọng: Báo cho trình duyệt biết đã viết xong để render title
    };

    return (
        <div className="min-h-screen -m-3 bg-slate-50 flex flex-col">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
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

                        <div className="flex flex-col">
                            <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-violet-600" />
                                Report Template Preview
                            </h1>
                            {data && (
                                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                    <span className="font-medium text-slate-700">{data.templateName}</span>
                                    <span className="px-1.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[10px]">
                                        v{data.version}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        Last Modified: {data.lastModified ? format(new Date(data.lastModified), "MMM dd, yyyy HH:mm") : "-"}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 mr-2">
                            <button
                                onClick={loadData}
                                disabled={loadingPreview}
                                className="p-2 cursor-pointer text-slate-600 hover:text-violet-700 hover:bg-white rounded-md transition-all disabled:opacity-50"
                                title="Refresh Preview"
                            >
                                <RotateCcw className={`w-4 h-4 ${loadingPreview ? 'animate-spin' : ''}`} />
                            </button>
                            <div className="w-px h-4 bg-slate-300 mx-1"></div>
                            <button
                                onClick={handleOpenNew}
                                className="p-2 cursor-pointer text-slate-600 hover:text-violet-700 hover:bg-white rounded-md transition-all"
                                title="Open in New Tab"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </button>
                        </div>

                        <button
                            className="flex btn btn-green-slow items-center gap-2 px-4 py-2 bg-violet-700 hover:bg-violet-800 text-white text-sm font-medium rounded-lg shadow-sm transition-all hover:shadow disabled:opacity-70 disabled:cursor-not-allowed"
                            onClick={handleDownload}
                            disabled={downloading || !data}
                        >
                            {downloading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <CloudDownload className="w-4 h-4" />
                            )}
                            <span className="hidden sm:inline">{downloading ? "Downloading..." : "Download (.docx)"}</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-hidden flex flex-col items-center justify-start pb-8 pt-4 px-4">

                <div className="w-full max-w-5xl h-[calc(100vh-10rem)] bg-slate-200/50 rounded-xl border border-slate-200 shadow-inner overflow-hidden flex flex-col relative">

                    <div className="h-10 bg-white border-b border-slate-200 flex items-center justify-between px-4 text-xs text-slate-400 select-none">
                        <span>Document Preview</span>
                        <span className="text-xs italic">
                            &lt;&lt;{data?.description ?? ""}&gt;&gt;
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-100/50">
                        {loadingPreview && !data ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                                <p>Loading template preview...</p>
                            </div>
                        ) : data ? (
                            <div className="mx-auto bg-white shadow-xl shadow-slate-200/60 min-h-[800px] w-full max-w-[210mm] p-[10mm] sm:p-[15mm] transition-all">
                                <div
                                    ref={previewRef}
                                    className="prose prose-sm sm:prose-base max-w-none font-serif text-slate-900"
                                    dangerouslySetInnerHTML={{ __html: data.htmlContent }}
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <p>No data available to preview.</p>
                                <button onClick={loadData} className="mt-2 text-violet-600 underline text-sm">Try Again</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-4 text-xs text-slate-400 text-center">
                    This preview was created using the conversion tool. The layout may differ slightly from the final version in the Word document.                </div>
            </main>
        </div>
    );
}
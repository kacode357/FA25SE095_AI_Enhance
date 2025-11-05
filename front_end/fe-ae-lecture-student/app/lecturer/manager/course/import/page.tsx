"use client";

import { ArrowLeft, FileSpreadsheet, HardDriveDownload, Info, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

import { useImportEnrollments } from "@/hooks/enrollments/useImportEnrollments";
import { useImportTemplate } from "@/hooks/enrollments/useImportTemplate";

export default function ImportEnrollmentsPage() {
    const router = useRouter();

    // Import
    const { importEnrollments, loading: importing } = useImportEnrollments();
    const { downloadImportTemplate, loading: downloading } = useImportTemplate();

    const [file, setFile] = useState<File | null>(null);
    const [createAccounts, setCreateAccounts] = useState(true);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const acceptMime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx";

    const pickFile = () => fileInputRef.current?.click();

    const validateAndSet = (f: File | null) => {
        if (!f) {
            setFile(null);
            setError(null);
            return;
        }
        const isValid = f.name.toLowerCase().endsWith(".xlsx");
        if (!isValid) {
            setFile(null);
            setError("Only .xlsx files are supported");
            return;
        }
        setError(null);
        setFile(f);
    };

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const f = e.dataTransfer.files?.[0] || null;
        validateAndSet(f);
    };

    const canSubmit = !!file && !importing;

    const handleSubmit = async () => {
        if (!canSubmit || !file) return;
        const res = await importEnrollments({
            file,
            // courseIds omitted intentionally (global import)
            createAccountIfNotFound: createAccounts,
        });
        if (res?.success) {
            router.push("/lecturer/manager/course");
        }
    };

    return (
        <div className="px-4 pb-4 pt-2">
            <div className="relative overflow-hidden mb-4 rounded-2xl border border-slate-200 shadow-[0_8px_28px_rgba(2,6,23,0.08)]">
                <div className="absolute inset-0 bg-gradient-to-r from-[#7f71f4] via-[#8b7cf8] to-[#f4a23b] opacity-90" />
                <div className="relative px-4 sm:px-5 py-5 text-white flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Import Enrollments</h1>
                        <p className="text-xs sm:text-sm text-white/90">Bulk import students via Excel • Lecturers & Staff only</p>
                    </div>
                    <Button
                        variant="ghost"
                        className="text-white/90 hover:text-white shadow-xl"
                        onClick={() => router.push("/lecturer/manager/course")}
                    >
                        <ArrowLeft className="size-4 mr-1" /> Back
                    </Button>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 shadow-sm p-4">
                <div className="grid grid-cols-1 md:grid-cols-[75%_25%] gap-4">
                    {/* Upload & Import */}
                    <Card className="p-5 border-slate-200 shadow-sm">
                        <h2 className="text-base font-semibold text-slate-900 mb-3">Upload & Import</h2>

                        {/* Dropzone */}
                        <div
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDragActive(true);
                            }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={onDrop}
                            className={`flex flex-col items-center justify-center text-center rounded-xl border-2 border-dashed p-8 transition-colors ${dragActive ? "border-indigo-400 bg-indigo-50/50" : "border-slate-300 bg-slate-50"
                                }`}
                        >
                            <FileSpreadsheet className="size-8 text-slate-500 mb-2" />
                            <p className="text-sm font-medium text-slate-700 mb-1">
                                {file ? file.name : "No file selected"}
                            </p>
                            <p className="text-xs text-slate-500">
                                Drag & drop your <span className="font-semibold">.xlsx</span> file here, or
                            </p>
                            <div className="mt-3 text-green-700">
                                <Button variant="outline" size="lg" onClick={pickFile} className="rounded-full">
                                    Choose File
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    id="importFile"
                                    type="file"
                                    accept={acceptMime}
                                    onChange={(e) => validateAndSet(e.target.files?.[0] || null)}
                                    className="hidden"
                                    aria-label="Import file"
                                />
                            </div>
                        </div>

                        {/* Options + Action */}
                        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="createAccounts"
                                    checked={createAccounts}
                                    onCheckedChange={(checked) => setCreateAccounts(!!checked)}
                                    className="border-slate-400 text-white data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                />
                                <label htmlFor="createAccounts" className="text-sm text-slate-700 cursor-pointer select-none">
                                    Auto-create accounts for unknown emails
                                </label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!canSubmit}
                                    className="bg-emerald-600 btn btn-gradient-slow hover:bg-emerald-700 text-white"
                                >
                                    <Upload className="size-4 mr-2" /> Start Import
                                </Button>
                                <Button className="text-violet-800 hover:text-violet-500" variant="ghost" onClick={() => router.push("/lecturer/manager/course")}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                        <div className="mt-2 text-[11px] text-slate-500">
                            {error ? (
                                <span className="text-amber-600">{error}</span>
                            ) : (
                                <span>Only .xlsx files are supported. Large files may take a moment.</span>
                            )}
                        </div>
                    </Card>

                    {/* Download Template */}
                    <Card className="p-5 border-slate-200 shadow-sm">
                        <h2 className="text-base font-semibold text-slate-900 mb-3">Download Template</h2>
                        <p className="text-sm text-slate-600 mb-4">
                            Use this Excel template to prepare your student list. Keep headers unchanged for best results.
                        </p>
                        <Button
                            onClick={downloadImportTemplate}
                            disabled={downloading}
                            className="bg-gradient-to-br from-orange-200 to-orange-500 text-white"
                        >
                            <HardDriveDownload className="size-4 mr-2" />
                            {downloading ? "Downloading..." : "Download Template (.xlsx)"}
                        </Button>
                        <div className="flex flex-row gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                            <Info className="size-4 shrink-0 mt-0.5" /> Template contains sample rows and valid columns. Remove example rows before importing.
                        </div>
                    </Card>

                </div>
            </div>
        </div>
    );
}

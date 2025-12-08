"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useImportStudentsSpecificCourse } from "@/hooks/enrollments/useImportStudentsSpecificCourse";
import { useImportStudentTemplate } from "@/hooks/enrollments/useImportStudentTemplate";
import { ArrowLeft, FileSpreadsheet, HardDriveDownload, Info, Loader2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
    courseId: string;
    onDone?: () => void;
}

export default function ImportStudentsSpecificCoursePage({ courseId, onDone }: Props) {
    const { importStudents, loading: importing } = useImportStudentsSpecificCourse();
    const { downloadTemplate, loading: downloading } = useImportStudentTemplate();

    const [file, setFile] = useState<File | null>(null);
    const [createAccounts, setCreateAccounts] = useState(true);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [localLoading, setLocalLoading] = useState(false);
    const [progress, setProgress] = useState<number | null>(null);

    const simIntervalRef = useRef<number | null>(null);
    const finishIntervalRef = useRef<number | null>(null);
    const finishTimeoutRef = useRef<number | null>(null);

    const acceptMime = ".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel";

    const pickFile = () => fileInputRef.current?.click();

    const validateAndSet = (f: File | null) => {
        if (!f) {
            setFile(null);
            setError(null);
            return;
        }
        const ok = f.name.toLowerCase().endsWith(".xlsx") || f.name.toLowerCase().endsWith(".xls");
        if (!ok) {
            setFile(null);
            setError("Only .xlsx or .xls files are supported");
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

    const isLoading = importing || localLoading;
    const canSubmit = !!file && !isLoading;

    useEffect(() => {
        // simulate multi-step progress while importing
        if (isLoading) {
            setProgress(5);
            if (finishIntervalRef.current) {
                clearInterval(finishIntervalRef.current);
                finishIntervalRef.current = null;
            }
            if (finishTimeoutRef.current) {
                clearTimeout(finishTimeoutRef.current);
                finishTimeoutRef.current = null;
            }
            if (simIntervalRef.current) clearInterval(simIntervalRef.current);
            simIntervalRef.current = window.setInterval(() => {
                setProgress((prev) => {
                    if (prev === null) return 5;
                    const next = prev + Math.floor(Math.random() * 6) + 1;
                    return next >= 95 ? 95 : next;
                });
            }, 350);
        } else {
            if (simIntervalRef.current) {
                clearInterval(simIntervalRef.current);
                simIntervalRef.current = null;
            }
            if (progress !== null) {
                if (finishIntervalRef.current) clearInterval(finishIntervalRef.current);
                finishIntervalRef.current = window.setInterval(() => {
                    setProgress((prev) => {
                        if (prev === null) return 100;
                        const next = Math.min(100, prev + Math.floor(Math.random() * 8) + 3);
                        if (next === 100) {
                            if (finishIntervalRef.current) {
                                clearInterval(finishIntervalRef.current);
                                finishIntervalRef.current = null;
                            }
                            finishTimeoutRef.current = window.setTimeout(() => setProgress(null), 900);
                        }
                        return next;
                    });
                }, 180);
            }
        }

        return () => {
            if (simIntervalRef.current) {
                clearInterval(simIntervalRef.current);
                simIntervalRef.current = null;
            }
            if (finishIntervalRef.current) {
                clearInterval(finishIntervalRef.current);
                finishIntervalRef.current = null;
            }
            if (finishTimeoutRef.current) {
                clearTimeout(finishTimeoutRef.current);
                finishTimeoutRef.current = null;
            }
        };
    }, [isLoading]);

    const handleSubmit = async () => {
        if (!canSubmit || !file) return;
        setLocalLoading(true);
        try {
            const res = await importStudents({
                file,
                courseId,
                createAccountIfNotFound: createAccounts,
            });
            if (res?.success) onDone?.();
        } finally {
            setLocalLoading(false);
        }
    };

    return (
        <div className="rounded-2xl border border-slate-200 shadow-sm p-4 mr-3.5">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-base text-slate-900">Import Students in this Course</h2>
                {onDone && (
                    <Button variant="ghost" className="text-violet-700 bg-violet-50 text-sm hover:text-violet-500" onClick={onDone}>
                        <ArrowLeft className="size-4 " /> Back to Students
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[70%_30%] gap-4">
                {/* Upload & Import */}
                <Card className="p-5 border-slate-200 shadow-sm">
                    <h3 className="text-base font-semibold text-slate-900 mb-3">Upload & Import</h3>

                    {/* Dropzone */}
                    <div
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragActive(true);
                        }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={onDrop}
                        className={`flex flex-col items-center justify-center text-center rounded-xl border-2 border-dashed p-8 transition-colors ${dragActive ? "border-indigo-400 bg-indigo-50/50" : file ? "border-emerald-400 bg-emerald-50/40" : "border-slate-300 bg-slate-50"}`}
                    >
                        {file ? (
                            <div className="w-full flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <FileSpreadsheet className="size-8 text-emerald-700" />
                                    <div className="text-left">
                                        <p className="text-sm font-semibold text-slate-900">{file.name}</p>
                                        <p className="text-xs text-slate-600">{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600" onClick={() => validateAndSet(null)}>Remove</Button>
                                    <Button variant="outline" size="sm" className="text-blue-500 hover:text-blue-600" onClick={pickFile}>Change</Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <FileSpreadsheet className="size-8 text-slate-500 mb-2" />
                                <p className="text-sm font-medium text-slate-700 mb-1">No file selected</p>
                                <p className="text-xs text-slate-500">Drag & drop your <span className="font-semibold">.xlsx/.xls</span> file here, or</p>
                                <div className="mt-3 text-green-700">
                                    <Button variant="outline" size="lg" onClick={pickFile} className="rounded-full">Choose File</Button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept={acceptMime}
                                        onChange={(e) => validateAndSet(e.target.files?.[0] || null)}
                                        className="hidden"
                                        aria-label="Import file"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Progress bar (shows while importing and briefly after completion) */}
                    {progress !== null && (
                        <div className="mt-4">
                            <div className="w-full bg-slate-100 rounded h-2 overflow-hidden">
                                <div
                                    className={`h-2 bg-emerald-500 transition-all duration-300`}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="text-xs text-slate-500 mt-1">{progress}%</div>
                        </div>
                    )}

                    {/* Options + Action */}
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="createAccounts"
                                checked={createAccounts}
                                onCheckedChange={(checked) => setCreateAccounts(!!checked)}
                                className="border-slate-400 text-white data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                            />
                            <label htmlFor="createAccounts" className="text-sm text-green-700 cursor-pointer select-none">
                                Auto-create accounts for unknown emails
                            </label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={handleSubmit}
                                disabled={!canSubmit}
                                className={`bg-emerald-600 btn btn-gradient-slow hover:bg-emerald-700 text-white ${!canSubmit ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                {isLoading ? <Loader2 className="animate-spin size-4 mr-2" /> : <Upload className="size-4 mr-2" />}
                                {isLoading ? "Importing..." : "Start Import"}
                            </Button>
                            {onDone && (
                                <Button variant="ghost" className="text-violet-800 hover:text-violet-500" onClick={onDone}>
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-500">
                        {error ? <span className="text-amber-600">{error}</span> : <span>Only .xlsx/.xls files are supported. Large files may take a moment.</span>}
                    </div>
                </Card>

                {/* Download Template */}
                <Card className="p-5 mr-4 border-slate-200 shadow-sm">
                    <h3 className="text-base font-semibold text-slate-900 mb-3">Download Template</h3>
                    <p className="text-sm text-slate-600 mb-4">Use this Excel template to prepare your student list for this course. Keep headers unchanged for best results.</p>
                    <Button onClick={downloadTemplate} disabled={downloading} className="bg-green-500 btn btn-green-slow text-white">
                        <HardDriveDownload className="size-4 mr-2" />
                        {downloading ? "Downloading..." : "Download Template (.xlsx)"}
                    </Button>
                    <div className="mt-3 flex flex-row gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                        <Info className="size-4 shrink-0 mt-0.5" /> Template contains sample rows and valid columns. Remove example rows before importing.
                    </div>
                </Card>
            </div>
        </div>
    );
}

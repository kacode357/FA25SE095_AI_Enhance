"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AccessCodeType } from "@/config/access-code-type";
import { Book } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

type FormState = {
    courseCodeId: string;
    termId: string;
    year: number;
    description: string;
    announcement?: string;
    syllabus?: File | null;
    requiresAccessCode: boolean;
    accessCodeType: AccessCodeType;
    customAccessCode?: string;
    accessCodeExpiresAt?: string;
};

type Props = {
    createdCourseId: string | null;
    form: FormState;
    setForm: React.Dispatch<React.SetStateAction<FormState>>;
    uploadRef: React.RefObject<HTMLDivElement | null>;
    uploading: boolean;
    handleUpload: () => Promise<void>;
    uploadedSyllabusUrl: string | null;
};

export default function UploadSyllabus({ createdCourseId, form, setForm, uploadRef, uploading, handleUpload, uploadedSyllabusUrl }: Props) {
    const uploadDisabled = uploading || !form.syllabus;
    const [progress, setProgress] = useState<number | null>(null);

    const simIntervalRef = useRef<number | null>(null);
    const finishIntervalRef = useRef<number | null>(null);
    const finishTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        // Start simulated increments while uploading
        if (uploading) {
            setProgress(5);
            // clear any previous finish timers
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
                    const next = prev + Math.floor(Math.random() * 6) + 1; // small random steps
                    return next >= 95 ? 95 : next; // don't finish here
                });
            }, 350);
        } else {
            // When uploading finished, stop sim interval and smoothly finish to 100
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
    }, [uploading]);
    const router = useRouter();

    return (
        <div className="w-full">
            <Card ref={uploadRef} className={`w-full p-4 border-dashed border-2 border-slate-200 bg-white`}>
                <h3 className="text-sm font-semibold mb-2">Upload Syllabus</h3>
                <div className="flex items-start gap-4">
                    {/* Highlight only the file info area when a file is selected */}
                    <div className={`${form.syllabus ? 'bg-emerald-50 border-emerald-300 border w-full rounded-md p-3 flex items-center gap-4' : 'flex items-center gap-4'}`}>
                        <div className="w-12 h-12 flex items-center justify-center bg-violet-50 rounded-lg">
                            <Book className="text-violet-600" />
                        </div>
                        <div className="flex-1">
                            {form.syllabus ? (
                                <div className="text-sm font-medium truncate text-emerald-800">{form.syllabus.name}</div>
                            ) : (
                                <div className="text-sm text-slate-700">No file selected</div>
                            )}
                            <div className="text-xs text-slate-500 mt-1">Accepted: .pdf, .doc, .docx</div>
                        </div>
                    </div>
                </div>

                {/* Progress bar (shows while uploading or briefly on completion) */}
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

                <div className="flex items-center justify-between gap-3 mt-4">
                    <div className="flex items-center gap-4">
                        <label className="inline-flex border-slate-400 items-center px-3 py-2 border rounded-md cursor-pointer text-sm bg-white hover:bg-slate-50">
                            Choose file
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => setForm((f) => ({ ...f, syllabus: e.target.files?.[0] ?? null }))}
                                disabled={!createdCourseId}
                                className="sr-only"
                            />
                        </label>

                        {form.syllabus && (
                            <button
                                onClick={() => setForm((f) => ({ ...f, syllabus: null }))}
                                className="text-sm cursor-pointer text-red-500 hover:text-red-600 px-2 py-1 rounded"
                                disabled={!createdCourseId}
                            >
                                Remove
                            </button>
                        )}
                    </div>
                    <Button
                        onClick={handleUpload}
                        loading={uploading}
                        className={`btn btn-gradient text-sm text-white ${uploadDisabled ? 'opacity-50 pointer-events-none' : ''}`}
                        disabled={uploadDisabled}
                        aria-disabled={uploadDisabled}
                    >
                        Upload
                    </Button>
                </div>
            </Card>

            <div className="mt-3 flex justify-end">
                <Button onClick={() => router.push('/lecturer/course')} className=" text-violet-800 hover:text-violet-500">
                    Back
                </Button>
            </div>
        </div>
    );
}

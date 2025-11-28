"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AccessCodeType } from "@/config/access-code-type";
import { Book } from "lucide-react";
import React from "react";

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

    return (
        <div className="w-1/2">
            <Card ref={uploadRef} className="p-4 border-dashed border-2 border-slate-200 bg-white">
                <h3 className="text-sm font-semibold mb-2">Upload Syllabus</h3>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-violet-50 rounded-lg">
                        <Book className="text-violet-600" />
                    </div>
                    <div className="flex-1">
                        {form.syllabus ? (
                            <div className="text-sm font-medium truncate">{form.syllabus.name}</div>
                        ) : (
                            <div className="text-sm text-slate-700">No file selected</div>
                        )}
                        <div className="text-xs text-slate-500 mt-1">Accepted: .pdf, .doc, .docx</div>
                    </div>
                </div>

                <div className="flex items-center gap-3 mt-4">
                    <label className="inline-flex items-center px-3 py-2 border rounded-md cursor-pointer text-sm bg-white hover:bg-slate-50">
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
        </div>
    );
}

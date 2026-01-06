"use client";
import React from "react";
import { UploadCloud, FileUp, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
    files: FileList | null;
    // Accept both RefObject and MutableRefObject with possible null current
    fileInputRef: React.RefObject<HTMLInputElement | null> | React.MutableRefObject<HTMLInputElement | null>;
    handleTriggerFile: () => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    desc: string;
    setDesc: (v: string) => void;
    handleUpload: () => void;
    uploading: boolean;
    metaError?: any;
};

export default function UploadSection({ files, fileInputRef, handleTriggerFile, handleFileChange, desc, setDesc, handleUpload, uploading, metaError }: Props) {
    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                <div className="flex-1 w-full space-y-2">
                    <label className="text-sm font-medium text-slate-700">File Attachment</label>
                    <div
                        onClick={handleTriggerFile}
                        className={
                            `
                                        border border-dashed rounded-lg px-4 py-3 cursor-pointer transition-colors flex items-center justify-between
                                        ${files && files.length > 0
                                ? "border-emerald-300 bg-emerald-50/30"
                                : "border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50"
                                }
                                    `}
                    >
                        <input
                            title="Template"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            type="file"
                            className="hidden"
                        />
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`p-2 rounded-full ${files ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                                <FileUp className="w-4 h-4" />
                            </div>
                            <span className="text-sm truncate text-slate-600">
                                {files && files.length > 0 ? files[0].name : "Click to select a file..."}
                            </span>
                        </div>
                        {files && (
                            <span className="text-xs text-emerald-600 font-medium px-2">Ready</span>
                        )}
                    </div>
                </div>

                <div className="flex-1 w-full space-y-2">
                    <label className="text-sm font-medium text-slate-700">Description <span className="text-slate-400 font-normal">(Optional)</span></label>
                    <input
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        placeholder="e.g., Course Syllabus for 2024"
                        className="flex h-[46px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:ring-offset-0"
                    />
                </div>

                <Button
                    onClick={handleUpload}
                    disabled={uploading || !files || files.length === 0}
                    className="h-[46px] w-full btn btn-green-slow md:w-auto min-w-[120px]"
                >
                    {uploading ? "Uploading..." : <><UploadCloud className="w-4 h-4 mr-2" /> Upload</>}
                </Button>
            </div>
            {metaError && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100 flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> Error loading templates metadata.
                </div>
            )}
        </div>
    );
}

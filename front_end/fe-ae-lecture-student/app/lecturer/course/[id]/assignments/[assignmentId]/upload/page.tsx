"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useUploadAttachments } from "@/hooks/assignment/useUploadAttachments";
import type { AssignmentAttachment } from "@/types/assignments/assignment.response";
import { format } from "date-fns";
import { AlertCircle, CheckCircle2, FileText, List, Trash2, UploadCloud } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

function fileListToArray(files: FileList | null): File[] {
    if (!files) return [];
    return Array.from(files);
}

export default function UploadAttachmentsPage() {
    const params = useParams() as { id?: string; assignmentId?: string };
    const router = useRouter();
    const courseId = params.id ?? "";
    const assignmentId = params.assignmentId ?? "";

    const { uploadAttachments, loading } = useUploadAttachments();
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<AssignmentAttachment[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const onChooseFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const arr = fileListToArray(e.target.files);
        setSelectedFiles((prev) => [...prev, ...arr]);
        e.currentTarget.value = "";
    };

    const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const arr = fileListToArray(e.dataTransfer.files);
        if (arr.length) setSelectedFiles((prev) => [...prev, ...arr]);
    }, []);

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => setIsDragging(false);

    const removeSelected = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (!assignmentId || selectedFiles.length === 0) return;
        const res = await uploadAttachments(assignmentId, selectedFiles as unknown as FileList, false);
        if (res?.success) {
            setUploadedFiles((prev) => [...res.uploadedFiles, ...prev]);
            setSelectedFiles([]);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    return (
        <div className="min-h-screen pb-8 pt-1 px-4">
            <div className="mx-auto max-w-5xl">
                {/* Header */}
                <div className="mb-8 mt-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Upload Attachments Resource</h1>
                            <p className="text-gray-600 mt-2">Add supporting files, documents, or resources for students</p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="ghost" className="btn btn-gradient-slow text-base" size="sm" onClick={() => router.push(`/lecturer/course/${courseId}?tab=assignments`)}>
                                <List className="mr-2 h-4 w-4" />
                                Assignment List
                            </Button>
                        </div>
                    </div>
                </div>

                <Card className="border-0 py-0 shadow-xl">
                    <div className="px-8 pb-2">
                        {/* Drag & Drop Zone */}
                        <div
                            className={`relative border-2 border-dashed rounded-xl p-8 sm:p-10 text-center transition-all duration-300 ${isDragging
                                    ? "border-blue-500 bg-blue-50/50"
                                    : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100/50"
                                }`}
                            onDrop={onDrop}
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                        >
                            <div className="flex flex-col items-center">
                                <div className={`p-3 rounded-full ${isDragging ? "bg-blue-100" : "bg-gray-200"} mb-4`}>
                                    <UploadCloud className={`h-10 w-10 ${isDragging ? "text-blue-600" : "text-gray-500"}`} />
                                </div>
                                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                                    {isDragging ? "Drop files here" : "Drag & drop files here"}
                                </h3>
                                <p className="text-gray-600 mb-6">or click to browse from your computer</p>

                                <div>
                                    <Input
                                        id="file-upload"
                                        type="file"
                                        multiple
                                        onChange={onChooseFiles}
                                        className="hidden"
                                        ref={inputRef}
                                    />
                                    <Button
                                        size="md"
                                        variant={isDragging ? "default" : "outline"}
                                        className="cursor-pointer text-blue-500 hover:text-blue-700 whitespace-nowrap"
                                        onClick={() => inputRef.current?.click()}
                                    >
                                        <UploadCloud className="mr-1 h-5 w-5" />
                                        <span className="whitespace-nowrap">Choose Files</span>
                                    </Button>
                                </div>
                            </div>

                            {isDragging && (
                                <div className="absolute inset-0 rounded-2xl bg-blue-500/10 pointer-events-none" />
                            )}
                        </div>

                        {/* Selected Files */}
                        {selectedFiles.length > 0 && (
                            <div className="mt-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Ready to upload ({selectedFiles.length})
                                    </h3>
                                    <Badge variant="secondary" className="text-sm">
                                        {selectedFiles.reduce((acc, f) => acc + f.size, 0) > 0
                                            ? formatFileSize(selectedFiles.reduce((acc, f) => acc + f.size, 0))
                                            : "0 Bytes"}
                                    </Badge>
                                </div>

                                <div className="space-y-2">
                                    {selectedFiles.map((file, i) => (
                                        <div
                                            key={`${file.name}-${i}`}
                                            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div className="p-3 bg-blue-100 rounded-lg">
                                                    <FileText className="h-6 w-6 text-blue-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">{file.name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {formatFileSize(file.size)} • {file.type || "Unknown type"}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => removeSelected(i)}
                                                className="text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                {loading && (
                                    <div className="mt-4">
                                        <Progress value={65} className="h-3" />
                                        <p className="text-sm text-center text-gray-600 mt-2">Uploading files...</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <Separator className="my-8" />

                        {/* Uploaded Files */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Uploaded Files</h3>
                                {uploadedFiles.length > 0 && (
                                    <Badge variant="outline" className="ml-2 text-green-600">
                                        {uploadedFiles.length} file{uploadedFiles.length > 1 ? "s" : ""}
                                    </Badge>
                                )}
                            </div>

                            {uploadedFiles.length === 0 ? (
                                <Alert className="border-dashed">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>No files uploaded yet. Uploaded files will appear here.</AlertDescription>
                                </Alert>
                            ) : (
                                <div className="grid gap-3">
                                    {uploadedFiles.map((file) => (
                                        <div
                                            key={file.id}
                                            className="flex items-center justify-between p-4 bg-green-50/50 border border-green-200 rounded-xl"
                                        >
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div className="p-3 bg-green-100 rounded-lg">
                                                    <FileText className="h-6 w-6 text-green-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <a
                                                        href={file.fileUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="font-medium text-green-700 hover:underline truncate block"
                                                    >
                                                        {file.fileName}
                                                    </a>
                                                    <p className="text-sm text-gray-600">
                                                        {formatFileSize(file.fileSize)} • Uploaded {format(new Date(file.uploadedAt), "PPP 'at' p")}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-green-700 border-green-300">
                                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                                Success
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-slate-50 border-t border-slate-200 px-8 py-6 rounded-b-2xl">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                {selectedFiles.length > 0
                                    ? `${selectedFiles.length} file${selectedFiles.length > 1 ? "s" : ""} ready to upload`
                                    : "No pending files"}
                            </p>
                            <div className="flex gap-3">
                                {(() => {
                                    const uploadDisabled = loading || selectedFiles.length === 0;
                                    return (
                                        <Button
                                            size="lg"
                                            onClick={handleUpload}
                                            disabled={uploadDisabled}
                                            className={`min-w-40 btn btn-green-slow text-base ${uploadDisabled ? "opacity-50 pointer-events-none cursor-not-allowed" : ""}`}
                                        >
                                            {loading ? (
                                                <>Uploading...</>
                                            ) : (
                                                <>
                                                    <UploadCloud className="mr-2 h-5 w-5" />
                                                    Upload {selectedFiles.length} File{selectedFiles.length > 1 ? "s" : ""}
                                                </>
                                            )}
                                        </Button>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
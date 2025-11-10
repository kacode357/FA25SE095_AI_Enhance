"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUploadCourseImage } from "@/hooks/course/useUploadCourseImage";
import { CheckCircle, Info, Loader2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function UploadCourseImageCard({ courseId }: { courseId?: string }) {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const { uploadCourseImage, loading } = useUploadCourseImage();
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const disabled = !courseId;

    // chọn file
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0];
            setFile(f);
            setPreviewUrl(URL.createObjectURL(f));
        }
    };

    // kéo thả file
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (disabled) return;
        const dropped = e.dataTransfer.files?.[0];
        if (dropped) {
            setFile(dropped);
            setPreviewUrl(URL.createObjectURL(dropped));
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (disabled) return;
    };

    const handleUpload = async () => {
        if (!file || loading) return;
        if (!courseId) {
            toast("Please create the course first before uploading an image.");
            return;
        }

        const res = await uploadCourseImage({ courseId, image: file });

        if (res?.success) {
            setUploadedUrl(res.imageUrl);
        }
    };

    return (
        <Card className="p-6 border-slate-200 shadow-sm relative">
            <div>
                <h2 className="text-base font-semibold text-slate-900 mb-3">Course Image</h2>
                <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={`border-2 border-dashed border-slate-300 rounded-lg p-6 text-center transition ${disabled ? "opacity-70" : "hover:border-indigo-400"}`}
            >
                {previewUrl ? (
                    <div className="flex flex-col items-center gap-2">
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-h-40 rounded-md object-contain border border-slate-200"
                        />
                        <p className="text-sm text-slate-600 mt-1">{file?.name}</p>
                        <button
                            onClick={() => {
                                setFile(null);
                                setPreviewUrl(null);
                            }}
                            className="text-xs text-rose-500 hover:underline"
                        >
                            Remove
                        </button>
                    </div>
                ) : (
                    <>
                        <Upload className="mx-auto mb-2 text-slate-400" size={36} />
                        <p className="font-medium text-slate-700">No file selected</p>
                        <p className="text-sm text-slate-500 mb-3">
                            Drag & drop your <span className="font-semibold">.jpg / .png / .webp</span> file here, or
                        </p>
                        {disabled ? (
                            <span className="text-green-600 font-semibold">Choose File</span>
                        ) : (
                            <>
                                <label
                                    htmlFor="courseImg"
                                    className="text-green-600 font-semibold cursor-pointer hover:underline"
                                >
                                    Choose File
                                </label>
                                <input
                                    id="courseImg"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </>
                        )}
                    </>
                )}
            </div>
            <span className="flex gap-1 my-2 items-center text-slate-400 text-sm"><Info className="size-4" /> Update images for specific Courses</span>
                {/* actions */}
                <div className="flex justify-end gap-4 mt-7">
                <Button
                    disabled={!file || loading || disabled}
                    onClick={handleUpload}
                    className="flex items-center gap-2 btn btn-gradient-slow text-white bg-gradient-to-r from-purple-400 to-indigo-500 hover:opacity-90"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin w-4 h-4" /> Uploading...
                        </>
                    ) : (
                        <>
                            <Upload size={16} /> Upload Image
                        </>
                    )}
                </Button>
            </div>

            </div>
            {/* hiển thị kết quả */}
            {uploadedUrl && (
                <div className="mt-5 text-sm text-green-700 flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    Uploaded successfully!
                    <a
                        href={uploadedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 underline ml-2"
                    >
                        View
                    </a>
                </div>
            )}

            {/* full-card overlay (covers entire card) */}
            {disabled && (
                <div className="absolute inset-0 z-20 rounded-2xl flex flex-col gap-2 items-center justify-center bg-white/40 backdrop-blur-xs pointer-events-auto">
                    <Info className="text-slate-500"/>
                    <div className="text-sm text-slate-600">You can upload an image after creating the course.</div>
                </div>
            )}
        </Card>
    );
}

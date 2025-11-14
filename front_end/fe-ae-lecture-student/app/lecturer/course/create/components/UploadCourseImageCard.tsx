"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDeleteCourseImage } from "@/hooks/course/useDeleteCourseImage";
import { useUploadCourseImage } from "@/hooks/course/useUploadCourseImage";
import { CheckCircle, Info, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export default function UploadCourseImageCard({ courseId }: { courseId?: string }) {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const { uploadCourseImage, loading } = useUploadCourseImage();
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const { deleteCourseImage, loading: deleting } = useDeleteCourseImage();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const disabled = !courseId;

    // chọn file
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0];
            setFile(f);
            setPreviewUrl(URL.createObjectURL(f));
            setUploadedUrl(null);
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
            setUploadedUrl(null);
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

    const handleChooseAnother = () => {
        if (disabled) return;
        // show upload button again and trigger file picker
        setUploadedUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        fileInputRef.current?.click();
    };

    const handleRemove = async () => {
        if (disabled) return;
        // If the image was already uploaded, delete it on server
        if (uploadedUrl && courseId) {
            const res = await deleteCourseImage({ courseId });
            if (!res?.success) return; // stop clearing UI if server deletion failed
        }
        // Clear local preview and selection
        setFile(null);
        setPreviewUrl(null);
        setUploadedUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <Card className="p-6 border-slate-200 shadow-sm relative">
            <div>
                <h2 className="text-base font-semibold text-slate-900 mb-3">Course Image</h2>
                {/* Dropzone */}
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
                            <div className="flex gap-5">
                                <button onClick={handleChooseAnother} className="text-xs cursor-pointer text-green-500 hover:underline">
                                    Choose another Image
                                </button>
                                <button onClick={handleRemove} disabled={deleting} className="text-xs text-rose-500 cursor-pointer hover:underline disabled:opacity-60">
                                    {deleting ? "Removing..." : "Remove"}
                                </button>
                            </div>
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
                                    <label htmlFor="courseImg" className="text-green-600 font-semibold cursor-pointer hover:underline">
                                        Choose File
                                    </label>
                                </>
                            )}
                        </>
                    )}
                </div>
                {/* Hidden file input is mounted once so we can trigger it from buttons in any state */}
                <input id="courseImg" ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <span className="flex gap-1 my-2 items-center text-slate-400 text-sm"><Info className="size-4" /> Update images for specific Courses</span>
                {/* actions */}
                {!uploadedUrl && (
                    <div className="flex justify-end gap-4 mt-7">
                        <Button
                            disabled={!file || loading || disabled}
                            onClick={handleUpload}
                            className="flex items-center gap-2 btn btn-gradient-slow text-white bg-gradient-to-r from-purple-400 to-indigo-500 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
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
                )}

            </div>
            {/* hiển thị kết quả */}
            {uploadedUrl && (
                <div className="text-sm text-green-700 flex justify-center items-center gap-2">
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
                    <Info className="text-slate-500" />
                    <div className="text-sm text-slate-600">You can upload an image after creating the course.</div>
                </div>
            )}
        </Card>
    );
}

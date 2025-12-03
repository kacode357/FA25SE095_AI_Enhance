"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUploadSyllabus } from "@/hooks/course-request/useUploadSyllabus";
import { Book } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
    courseRequestId: string | null;
};

export default function UploadSyllabusCourseRequest({ courseRequestId }: Props) {
    const { uploadSyllabus, loading } = useUploadSyllabus();
    const [file, setFile] = useState<File | null>(null);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const [uploaded, setUploaded] = useState<boolean>(false);
    const router = useRouter();

    const uploadDisabled = loading || !file || !courseRequestId;

    const handleUpload = async () => {
        if (!courseRequestId || !file) return;
        const res = await uploadSyllabus(courseRequestId, file);
        if (res?.success) {
            setUploaded(true);
            if (res.fileUrl) setUploadedUrl(res.fileUrl);
            // After successful upload, go back to Requests page and force remount via query param
            const ts = Date.now();
            await router.push(`/lecturer/manage-courses/requests?refresh=${ts}`);
            router.refresh();
        }
    };

    return (
        <div className="w-full" id="upload-syllabus-course-request">
            <Card className="w-full p-4 border-dashed border-2 border-slate-200 bg-white">
                <h3 className="text-sm font-semibold mb-2">Upload Syllabus (Course Request)</h3>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-violet-50 rounded-lg">
                        <Book className="text-violet-600" />
                    </div>
                    <div className="flex-1">
                        <div className={
                            `transition-colors duration-200 ${file || uploaded || uploadedUrl ? 'bg-green-50 border border-green-200 rounded-md p-3' : ''}`
                        }>
                            {file ? (
                                <div className="text-sm font-medium truncate text-slate-900">{file.name}</div>
                            ) : (
                                <div className="text-sm text-slate-700">No file selected</div>
                            )}

                            <div className="text-xs text-slate-500 mt-1">Accepted: .pdf, .doc, .docx</div>

                            {uploadedUrl && (
                                <div className="text-xs text-green-700 mt-2 truncate">Uploaded: <a className="underline" href={uploadedUrl} target="_blank" rel="noreferrer">Open file</a></div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3 mt-4">
                    <div className="flex items-center gap-4">
                        <label className="inline-flex items-center px-3 py-2 border rounded-md cursor-pointer text-sm bg-white hover:bg-slate-50">
                            Choose file
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                                disabled={!courseRequestId}
                                className="sr-only"
                            />
                        </label>

                        {file && (
                            <button
                                onClick={() => setFile(null)}
                                className="text-sm cursor-pointer text-red-500 hover:text-red-600 px-2 py-1 rounded"
                                disabled={!courseRequestId}
                            >
                                Remove
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={async () => {
                                const ts = Date.now();
                                await router.push(`/lecturer/manage-courses/requests?refresh=${ts}`);
                                router.refresh();
                            }}
                            variant="ghost"
                            className="text-sm text-violet-800 hover:text-violet-500"
                        >
                            Close
                        </Button>
                        {/* <Button
                            onClick={async () => {
                                await router.push('/lecturer/manage-courses/requests');
                                router.refresh();
                            }}
                            variant="ghost"
                            className="text-sm text-violet-800 hover:text-violet-500"
                        >
                            Cancel
                        </Button> */}

                        <Button
                            onClick={handleUpload}
                            loading={loading}
                            className={`btn btn-gradient text-sm text-white ${uploadDisabled ? 'opacity-50 pointer-events-none' : ''}`}
                            disabled={uploadDisabled}
                            aria-disabled={uploadDisabled}
                        >
                            Upload
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}

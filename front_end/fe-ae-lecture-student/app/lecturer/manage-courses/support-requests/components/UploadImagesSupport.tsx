"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
// using native input for file selection to preserve onChange behaviour
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useMySupportRequests } from "@/hooks/support-requests/useMySupportRequests";
import { useUploadSupportRequestImages } from "@/hooks/support-requests/useUploadSupportRequestImages";
import type { SupportRequestItem, UploadSupportRequestImagesResponse } from "@/types/support/support-request.response";
import { formatToVN } from "@/utils/datetime/time";
import { AlertCircle, CheckCircle2, Trash2, UploadCloud } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

function fileListToArray(files: FileList | null): File[] {
  if (!files) return [];
  return Array.from(files);
}

const ALLOWED_EXTS = ["jpg", "jpeg", "png", "gif", "webp"];
const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

function fileExtension(name: string) {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

function validateImageFile(file: File) {
  const ext = fileExtension(file.name);
  const mime = file.type;

  if (!ext || !ALLOWED_EXTS.includes(ext)) {
    return { ok: false, reason: `File type '.${ext || ""}' is not allowed.` };
  }
  if (!mime || !ALLOWED_MIMES.includes(mime)) {
    return { ok: false, reason: `MIME '${mime || "unknown"}' is not allowed.` };
  }

  return { ok: true, reason: "" }; // added reason to avoid undefined
}


export default function UploadImagesSupport() {
  const router = useRouter();
  const params = useSearchParams();
  const requestId = params?.get("requestId") ?? "";

  const { uploadSupportRequestImages, loading } = useUploadSupportRequestImages();
  const { fetchMySupportRequests, loading: loadingRequests, items } = useMySupportRequests();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // support request details
  const [request, setRequest] = useState<SupportRequestItem | null>(null);

  // When requestId changes, ensure we have the latest items and set the request.
  // Guards below avoid re-triggering fetch in a loop when `items` updates.
  useEffect(() => {
    let mounted = true;
    if (!requestId) {
      setRequest(null);
      return () => {
        mounted = false;
      };
    }

    // If items already contain the request, use it and skip fetching.
    const foundNow = items.find((it) => it.id === requestId) ?? null;
    if (foundNow) {
      setRequest(foundNow);
      return () => {
        mounted = false;
      };
    }

    // Otherwise fetch once; after fetch the `items` array will update and
    // the effect above will pick up the item without re-triggering fetch.
    (async () => {
      try {
        await fetchMySupportRequests({ pageNumber: 1, pageSize: 200 });
      } catch (err) {
        // ignore fetch errors here; UI can show missing data
      }
    })();

    return () => {
      mounted = false;
    };
  }, [requestId, fetchMySupportRequests, items]);

  const previews = useMemo(() => selectedFiles.map((f) => URL.createObjectURL(f)), [selectedFiles]);

  useEffect(() => {
    return () => {
      previews.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [previews]);

  const onChooseFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arr = fileListToArray(e.target.files);
    if (!arr.length) return;

    const accepted: File[] = [];
    const rejected: { name: string; reason: string }[] = [];

    arr.forEach((f) => {
      const v = validateImageFile(f);
      if (v.ok) accepted.push(f);
      else rejected.push({ name: f.name, reason: v.reason });
    });

    if (accepted.length) setSelectedFiles((prev) => [...prev, ...accepted]);
    if (rejected.length) {
      const names = rejected.map((r) => `${r.name} (${r.reason})`).join(", ");
      toast.error(`Some files were not accepted: ${names}. Allowed types: .${ALLOWED_EXTS.join(", .")}`);
    }
    // reset input
    if (e.currentTarget) e.currentTarget.value = "";
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const arr = fileListToArray(e.dataTransfer.files);
    if (!arr.length) return;

    const accepted: File[] = [];
    const rejected: { name: string; reason: string }[] = [];

    arr.forEach((f) => {
      const v = validateImageFile(f);
      if (v.ok) accepted.push(f);
      else rejected.push({ name: f.name, reason: v.reason });
    });

    if (accepted.length) setSelectedFiles((prev) => [...prev, ...accepted]);
    if (rejected.length) {
      const names = rejected.map((r) => `${r.name} (${r.reason})`).join(", ");
      toast.error(`Some files were not accepted: ${names}. Allowed types: .${ALLOWED_EXTS.join(", .")}`);
    }
  }, []);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const removeSelected = (index: number) => setSelectedFiles((prev) => prev.filter((_, i) => i !== index));

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleUpload = async () => {
    if (!requestId) {
      toast.error("Missing support request id.");
      return;
    }
    if (selectedFiles.length === 0) {
      toast.error("Please select images to upload.");
      return;
    }

    try {
      const res: UploadSupportRequestImagesResponse = await uploadSupportRequestImages(requestId, selectedFiles);
      if (res?.success) {
        toast.success(res.message ?? "Uploaded images.");
        setUploadedUrls(res.uploadedImageUrls || []);
        setSelectedFiles([]);
        // navigate back after short delay
        setTimeout(() => router.push(`/lecturer/manage-courses/support-requests`), 700);
      } else {
        toast.error(res?.message ?? "Upload failed.");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "An error occurred while uploading images.");
    }
  };

  return (
    <div className="min-h-screen pb-8 pt-4 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Attach images to support request</h1>
              <p className="text-gray-600 mt-2">Add screenshots or photos to help staff understand the issue</p>
            </div>
            <div />
          </div>
        </div>

        <Card className="border-0 py-0 shadow-xl">
          <div className="px-8 pb-2">
            {/* Request info */}
            <div className="mb-6">
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Subject</p>
                  <div className="mt-1 font-medium">{request?.subject ?? requestedLabel(requestId)}</div>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Course</p>
                  <div className="mt-1">{request?.courseName ?? "-"}</div>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Requester</p>
                  <div className="mt-1">{request?.requesterName ?? "-"}</div>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Requested At</p>
                  <div className="mt-1">{request?.requestedAt ? formatToVN(request.requestedAt, { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "-"}</div>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-slate-500">Description</p>
                  <div className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{request?.description ?? "-"}</div>
                </div>
              </div>
            </div>

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
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">{isDragging ? "Drop images here" : "Drag & drop images here"}</h3>
                <p className="text-gray-600 mb-6">or click to browse from your computer</p>

                <div>
                  <input placeholder="file-upload" id="file-upload" type="file" multiple accept="image/*" onChange={onChooseFiles} className="sr-only" ref={inputRef} />
                  <Button size="md" variant={isDragging ? "default" : "outline"} className="cursor-pointer text-blue-500 hover:text-blue-700 whitespace-nowrap" onClick={() => inputRef.current?.click()}>
                    <UploadCloud className="mr-1 h-5 w-5" />
                    <span className="whitespace-nowrap">Choose Images</span>
                  </Button>
                </div>
              </div>

              {isDragging && <div className="absolute inset-0 rounded-2xl bg-blue-500/10 pointer-events-none" />}
            </div>

            {/* Selected Images */}
            {selectedFiles.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Ready to upload ({selectedFiles.length})</h3>
                  <Badge variant="secondary" className="text-sm">{selectedFiles.reduce((acc, f) => acc + f.size, 0) > 0 ? formatFileSize(selectedFiles.reduce((acc, f) => acc + f.size, 0)) : "0 Bytes"}</Badge>
                </div>

                <div className="space-y-2">
                  {selectedFiles.map((file, i) => (
                    <div key={`${file.name}-${i}`} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-16 h-12 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                          <img src={previews[i]} alt={file.name} className="object-cover w-full h-full" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(file.size)} • {file.type || "image/*"}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => removeSelected(i)} className="text-red-600 hover:bg-red-50">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                </div>

                {loading && (
                  <div className="mt-4">
                    <Progress value={65} className="h-3" />
                    <p className="text-sm text-center text-gray-600 mt-2">Uploading images...</p>
                  </div>
                )}
              </div>
            )}

            <Separator className="my-8" />

            {/* Uploaded images preview */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Uploaded Images</h3>
              </div>

              {uploadedUrls.length === 0 ? (
                <Alert className="border-dashed">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>No images uploaded yet. Uploaded images will appear here.</AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {uploadedUrls.map((u, i) => (
                    <a key={i} href={u} target="_blank" rel="noreferrer" className="block border rounded overflow-hidden">
                      <img src={u} alt={`uploaded-${i}`} className="object-cover w-full h-40" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-slate-50 border-t border-slate-200 px-8 py-6 rounded-b-2xl">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">{selectedFiles.length > 0 ? `${selectedFiles.length} image${selectedFiles.length > 1 ? "s" : ""} ready to upload` : "No pending images"}</p>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => router.push(`/lecturer/manage-courses/support-requests`)}>
                  Cancel
                </Button>
                <Button size="lg" className="btn btn-green-slow" onClick={handleUpload} disabled={loading || selectedFiles.length === 0}>
                  {loading ? "Uploading..." : `Upload ${selectedFiles.length} Image${selectedFiles.length > 1 ? "s" : ""}`}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function requestedLabel(id: string) {
  return id ? id : "(missing)";
}

// app/student/courses/[id]/support/components/SupportRequestCreate.tsx
"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Loader2, X, Paperclip } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { SupportRequestCategory } from "@/config/classroom-service/support-request-category.enum";
import { SupportRequestPriority } from "@/config/classroom-service/support-request-priority.enum";
import { useCreateSupportRequest } from "@/hooks/support-requests/useCreateSupportRequest";
import { useUploadSupportRequestImages } from "@/hooks/support-requests/useUploadSupportRequestImages";

type Props = {
  courseId: string;
  onCreated?: () => Promise<void> | void;
};

type CreateResponse = {
  success: boolean;
  message: string;
  supportRequestId: string;
};

const MAX_IMAGES_PER_REQUEST = 5;
const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

export function SupportRequestCreate({ courseId, onCreated }: Props) {
  const { createSupportRequest, loading: creating } = useCreateSupportRequest();
  const { uploadSupportRequestImages, loading: uploading } =
    useUploadSupportRequestImages();

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<SupportRequestPriority>(
    SupportRequestPriority.Medium
  );
  const [category, setCategory] = useState<SupportRequestCategory>(
    SupportRequestCategory.Technical
  );

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      setSelectedFiles([]);
      setFileError("");
      return;
    }

    const files = Array.from(e.target.files);

    if (files.length > MAX_IMAGES_PER_REQUEST) {
      setSelectedFiles([]);
      setFileError(`You can upload up to ${MAX_IMAGES_PER_REQUEST} images.`);
      e.target.value = "";
      return;
    }

    const tooBig = files.filter((f) => f.size > MAX_IMAGE_SIZE_BYTES);
    if (tooBig.length > 0) {
      setSelectedFiles([]);
      setFileError(`Each image must be at most ${MAX_IMAGE_SIZE_MB}MB.`);
      e.target.value = "";
      return;
    }

    setFileError("");
    setSelectedFiles(files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFileError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;

    if (fileError) return;

    const res = (await createSupportRequest({
      courseId,
      priority,
      category,
      subject: subject.trim(),
      description: description.trim(),
    })) as unknown as CreateResponse;

    if (res && res.success && res.supportRequestId) {
      const newRequestId = res.supportRequestId;

      if (selectedFiles.length > 0) {
        await uploadSupportRequestImages(newRequestId, selectedFiles);
      }

      setSubject("");
      setDescription("");
      setPriority(SupportRequestPriority.Medium);
      setCategory(SupportRequestCategory.Technical);
      setSelectedFiles([]);
      setFileError("");
      if (fileInputRef.current) fileInputRef.current.value = "";

      if (onCreated) {
        await onCreated();
      }
    } else {
      // TODO: show toast error nếu cần
    }
  };

  const isLoading = creating || uploading;

  return (
    <Card className="card rounded-2xl">
      <CardHeader>
        <CardTitle className="text-base">New Support Request</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Priority + Category */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Priority
              </label>
              <Select
                value={String(priority)}
                onValueChange={(v) =>
                  setPriority(Number(v) as SupportRequestPriority)
                }
              >
                <SelectTrigger
                  // Cập nhật style nhẹ nhàng hơn
                  className="h-9 text-sm border border-slate-200 focus:ring-1 focus:ring-slate-300 focus:ring-offset-0 focus:outline-none"
                >
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={String(SupportRequestPriority.Low)}>
                    Low
                  </SelectItem>
                  <SelectItem value={String(SupportRequestPriority.Medium)}>
                    Medium
                  </SelectItem>
                  <SelectItem value={String(SupportRequestPriority.High)}>
                    High
                  </SelectItem>
                  <SelectItem value={String(SupportRequestPriority.Urgent)}>
                    Urgent
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Category
              </label>
              <Select
                value={String(category)}
                onValueChange={(v) =>
                  setCategory(Number(v) as SupportRequestCategory)
                }
              >
                <SelectTrigger
                   // Cập nhật style nhẹ nhàng hơn
                  className="h-9 text-sm border border-slate-200 focus:ring-1 focus:ring-slate-300 focus:ring-offset-0 focus:outline-none"
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value={String(SupportRequestCategory.Technical)}
                  >
                    Technical
                  </SelectItem>
                  <SelectItem value={String(SupportRequestCategory.Academic)}>
                    Academic
                  </SelectItem>
                  <SelectItem
                    value={String(SupportRequestCategory.Administrative)}
                  >
                    Administrative
                  </SelectItem>
                  <SelectItem value={String(SupportRequestCategory.Other)}>
                    Other
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Subject
            </label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="E.g. Cannot access assignment..."
              // Cập nhật style nhẹ nhàng hơn
              className="h-9 text-sm border border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-300 focus-visible:ring-offset-0"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your issue..."
              // --- FIX CHÍNH Ở ĐÂY ---
              // focus-visible:ring-1 (mỏng)
              // focus-visible:ring-slate-300 (màu xám nhạt thay vì đen)
              className="min-h-[120px] text-sm border border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-300 focus-visible:ring-offset-0"
              required
            />
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-700 flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                Attachments{" "}
                <span className="text-slate-400 font-normal">
                  (Max {MAX_IMAGES_PER_REQUEST} images, max{" "}
                  {MAX_IMAGE_SIZE_MB}MB each)
                </span>
              </label>
            </div>

            <input
              ref={fileInputRef}
              id="support-attachments"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isLoading}
            />

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium shadow-sm
                           bg-slate-900 text-white hover:bg-slate-800
                           disabled:opacity-60 disabled:cursor-not-allowed
                           focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-900"
              >
                <Paperclip className="h-3.5 w-3.5" />
                <span>Select files</span>
              </button>
              <p className="text-[11px] text-slate-500 truncate">
                {selectedFiles.length > 0
                  ? `${selectedFiles.length} file(s) selected`
                  : "No files selected"}
              </p>
            </div>

            {selectedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-200 text-[11px] text-slate-700"
                  >
                    <span className="truncate max-w-[120px]">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-slate-400 hover:text-red-500 ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {fileError && (
              <p className="text-[11px] text-red-500 mt-1">{fileError}</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-slate-500">
              Response sent via support chat.
            </p>
            <Button
              type="submit"
              className="btn btn-gradient px-4 py-2 h-9 text-sm"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {uploading
                ? "Uploading Images..."
                : creating
                  ? "Creating Request..."
                  : "Submit Request"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
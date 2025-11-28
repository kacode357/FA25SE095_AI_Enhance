// app/student/courses/[id]/support/components/SupportRequestList.tsx
"use client";

import type React from "react";
import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Loader2,
  MessageCircle,
  Image as ImageIcon,
  UploadCloud,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SupportRequestItem } from "@/types/support/support-request.response";

import { useMySupportRequests } from "@/hooks/support-requests/useMySupportRequests";
import { useUploadSupportRequestImages } from "@/hooks/support-requests/useUploadSupportRequestImages";

import {
  categoryBadgeClass,
  categoryLabel,
  formatDateTime,
  priorityBadgeClass,
  priorityLabel,
  statusBadgeClass,
  statusLabel,
} from "./support-labels";
import { SupportRequestStatus } from "@/config/classroom-service/support-request-status.enum";

type Props = {
  courseId: string;
  /** External trigger to force refetch */
  refreshKey?: number;
};

export function SupportRequestList({ courseId, refreshKey }: Props) {
  const router = useRouter();

  const {
    fetchMySupportRequests,
    loading: loadingList,
    items,
  } = useMySupportRequests();

  const { uploadSupportRequestImages, loading: uploadingGlobal } =
    useUploadSupportRequestImages();

  const [filesByRequest, setFilesByRequest] = useState<Record<string, File[]>>(
    {}
  );
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<Record<string, string>>(
    {}
  );

  // Load user's support requests for this course
  useEffect(() => {
    if (!courseId) return;
    fetchMySupportRequests({
      courseId,
      pageNumber: 1,
      pageSize: 20,
    });
  }, [courseId, fetchMySupportRequests, refreshKey]);

  const handleOpenChat = useCallback(
    (item: SupportRequestItem) => {
      if (!item.conversationId) return;

      // Pass peer info so the chat page knows who the conversation is with
      const peerId = item.assignedStaffId ?? "";
      const peerName = item.assignedStaffName ?? "Support Staff";

      const url = `/student/courses/${courseId}/support/${item.conversationId}?peerId=${encodeURIComponent(
        peerId
      )}&peerName=${encodeURIComponent(
        peerName
      )}&requestId=${encodeURIComponent(item.id)}`;

      router.push(url);
    },
    [router, courseId]
  );

  const handleFileChange = useCallback(
    (requestId: string, e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      setFilesByRequest((prev) => ({
        ...prev,
        [requestId]: files,
      }));

      // Clear previous upload message when selecting new files
      setUploadMessage((prev) => ({
        ...prev,
        [requestId]: "",
      }));
    },
    []
  );

  const handleUploadImages = useCallback(
    async (item: SupportRequestItem) => {
      const files = filesByRequest[item.id] || [];
      if (!files.length) {
        setUploadMessage((prev) => ({
          ...prev,
          [item.id]: "Please select image(s) first.",
        }));
        return;
      }

      try {
        setUploadingId(item.id);
        setUploadMessage((prev) => ({
          ...prev,
          [item.id]: "",
        }));

        const res = await uploadSupportRequestImages(item.id, files);

        if (res.success) {
          setUploadMessage((prev) => ({
            ...prev,
            [item.id]: `Uploaded ${res.uploadedCount} image(s).`,
          }));
          // Clear the selected files after a successful upload
          setFilesByRequest((prev) => ({
            ...prev,
            [item.id]: [],
          }));
        } else {
          setUploadMessage((prev) => ({
            ...prev,
            [item.id]: res.message || "Upload failed.",
          }));
        }
      } catch (err) {
        console.error("[support] upload images error", err);
        setUploadMessage((prev) => ({
          ...prev,
          [item.id]: "Upload failed. Please try again.",
        }));
      } finally {
        setUploadingId(null);
      }
    },
    [filesByRequest, uploadSupportRequestImages]
  );

  return (
    <Card className="card rounded-2xl">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <span>My Support Requests</span>
          {loadingList && (
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 max-h-[420px] overflow-y-auto">
        {items.length === 0 && !loadingList && (
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-500">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span>
              You have not submitted any support requests for this course yet.
            </span>
          </div>
        )}

        {items.map((item: SupportRequestItem) => {
          const isUploading = uploadingId === item.id;
          const selectedFiles = filesByRequest[item.id] || [];

          const canUploadImages =
            item.status === SupportRequestStatus.Pending ||
            item.status === SupportRequestStatus.InProgress ||
            item.status === SupportRequestStatus.Resolved;

          // Parse images JSON string -> string[]
          let imageUrls: string[] = [];
          if (item.images) {
            try {
              const parsed = JSON.parse(item.images) as unknown;
              if (Array.isArray(parsed)) {
                imageUrls = parsed.filter(
                  (u): u is string => typeof u === "string"
                );
              }
            } catch (e) {
              console.error("[support] failed to parse images JSON", e);
            }
          }

          return (
            <div
              key={item.id}
              className="border border-slate-200 rounded-lg p-3 bg-white text-xs"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                {/* LEFT SIDE: subject, category, priority, description, attachments, requested */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  {/* Subject */}
                  <div className="text-slate-900">
                    <span className="text-[11px] font-medium text-slate-500 mr-1.5">
                      Subject:
                    </span>
                    <span className="font-semibold">{item.subject}</span>
                  </div>

                  {/* Category */}
                  <div className="flex items-center gap-1 text-[11px] text-slate-600">
                    <span className="font-medium text-slate-500">Category:</span>
                    <span className={categoryBadgeClass(item.category)}>
                      {categoryLabel(item.category)}
                    </span>
                  </div>

                  {/* Priority */}
                  <div className="flex items-center gap-1 text-[11px] text-slate-600">
                    <span className="font-medium text-slate-500">Priority:</span>
                    <span className={priorityBadgeClass(item.priority)}>
                      {priorityLabel(item.priority)}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="text-[11px] text-slate-600">
                    <span className="font-medium text-slate-500 mr-1">
                      Description:
                    </span>
                    <span className="line-clamp-2">
                      {item.description || "No description provided."}
                    </span>
                  </div>

                  {/* Attachments (images) */}
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center gap-1 text-[11px] text-slate-600">
                      <ImageIcon className="h-3.5 w-3.5" />
                      <span className="font-medium text-slate-500">
                        Image attachments
                      </span>
                      <span className="text-[10px] text-slate-400">
                        (available after request is created)
                      </span>
                    </div>

                    {canUploadImages ? (
                      <div className="flex flex-col gap-1">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleFileChange(item.id, e)}
                          className="block w-full cursor-pointer text-[11px]
                                     file:mr-2 file:rounded-md file:border-0 file:bg-slate-100
                                     file:px-2 file:py-1 file:text-[11px] file:font-medium
                                     file:text-slate-700 hover:file:bg-slate-200"
                        />
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[10px] text-slate-500 truncate">
                            {selectedFiles.length > 0
                              ? `${selectedFiles.length} file(s) selected`
                              : "No files selected"}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleUploadImages(item)}
                            disabled={
                              isUploading ||
                              uploadingGlobal ||
                              selectedFiles.length === 0
                            }
                            className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium shadow-sm
                                       bg-slate-900 text-white hover:bg-slate-800
                                       disabled:opacity-60 disabled:cursor-not-allowed
                                       focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-900"
                          >
                            {(isUploading || uploadingGlobal) ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                <span>Uploading...</span>
                              </>
                            ) : (
                              <>
                                <UploadCloud className="h-3.5 w-3.5" />
                                <span>Upload</span>
                              </>
                            )}
                          </button>
                        </div>
                        {uploadMessage[item.id] && (
                          <p className="text-[10px] text-slate-500">
                            {uploadMessage[item.id]}
                          </p>
                        )}

                        {/* Existing uploaded images */}
                        {imageUrls.length > 0 && (
                          <div className="mt-1 space-y-1">
                            <p className="text-[10px] text-slate-500">
                              Existing images:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {imageUrls.map((url, idx) => (
                                <a
                                  key={`${item.id}-${idx}`}
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block"
                                >
                                  <img
                                    src={url}
                                    alt={`Attachment ${idx + 1}`}
                                    className="h-12 w-12 rounded-md object-cover border border-slate-200"
                                  />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400">
                        Attachments are not available for cancelled/rejected
                        requests.
                      </p>
                    )}
                  </div>

                  {/* Requested timestamp in the bottom-right */}
                  {item.requestedAt && (
                    <div className="flex justify-end pt-1 text-[10px] text-slate-500">
                      <span>Requested: {formatDateTime(item.requestedAt)}</span>
                    </div>
                  )}
                </div>

                {/* RIGHT SIDE: status + open chat */}
                <div className="flex flex-col items-end gap-2 sm:pl-4">
                  {/* Status shown on the top-right */}
                  <div className="flex items-center gap-1 text-[11px] text-slate-600">
                    <span className="font-medium text-slate-500">Status:</span>
                    <span className={statusBadgeClass(item.status)}>
                      {statusLabel(item.status)}
                    </span>
                  </div>

                  {/* Chat button under the status; only visible when In Progress */}
                  {item.status === SupportRequestStatus.InProgress && (
                    <button
                      type="button"
                      onClick={() => handleOpenChat(item)}
                      disabled={!item.conversationId || !item.assignedStaffId}
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium shadow-sm
                                 bg-[var(--brand)] text-white hover:brightness-105
                                 disabled:opacity-60 disabled:cursor-not-allowed
                                 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--brand)]"
                      aria-label="Open support chat"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>Open chat</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

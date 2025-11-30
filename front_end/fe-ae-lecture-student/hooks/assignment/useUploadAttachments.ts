"use client";

import { AssignmentService } from "@/services/assignment.services";
import type { UploadAssignmentAttachmentsResponse } from "@/types/assignments/assignment.response";
import { useState } from "react";
import { toast } from "sonner";

export function useUploadAttachments() {
  const [loading, setLoading] = useState(false);

  const uploadAttachments = async (
    assignmentId: string,
    files: File[] | FileList,
    suppressToast = false
  ): Promise<UploadAssignmentAttachmentsResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await AssignmentService.uploadAttachments(assignmentId, files);
      if (!suppressToast) {
        if (res?.success) toast.success(res.message || "Uploaded files successfully");
        else toast.error(res?.message || "Upload failed");
      }
      return res;
    } catch (err) {
      if (!suppressToast) toast.error("Upload failed. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { uploadAttachments, loading };
}

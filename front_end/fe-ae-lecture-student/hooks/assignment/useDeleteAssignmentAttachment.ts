"use client";

import { AssignmentService } from "@/services/assignment.services";
import type { DeleteAssignmentAttachmentResponse } from "@/types/assignments/assignment.response";
import { useState } from "react";
import { toast } from "sonner";

export function useDeleteAssignmentAttachment() {
  const [loading, setLoading] = useState(false);

  const deleteAttachment = async (
    assignmentId: string,
    fileId: string,
    suppressToast = false
  ): Promise<DeleteAssignmentAttachmentResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await AssignmentService.deleteAttachment(assignmentId, fileId);
      if (!suppressToast) {
        if (res?.success) toast.success(res.message || "File deleted successfully");
        else toast.error(res?.message || "Failed to delete file");
      }
      return res;
    } catch (err) {
      if (!suppressToast) toast.error("Failed to delete file. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { deleteAttachment, loading };
}

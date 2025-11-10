"use client";

import { AssignmentService } from "@/services/assignment.services";
import { AssignmentStatus, DeleteAssignmentResponse } from "@/types/assignments/assignment.response";
import { useState } from "react";
import { toast } from "sonner";

export function useDeleteAssignment() {
  const [loading, setLoading] = useState(false);

  const deleteAssignment = async (
    id: string,
    status?: AssignmentStatus
  ): Promise<DeleteAssignmentResponse | null> => {
    if (loading) return null;
    if (status && status !== AssignmentStatus.Draft) {
      toast.error("Only Draft assignments can be deleted.");
      return null;
    }
    setLoading(true);
    try {
      const res = await AssignmentService.remove(id);
      toast.success(res.message || "Assignment deleted");
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { deleteAssignment, loading };
}

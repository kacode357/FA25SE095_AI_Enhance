"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AssignmentService } from "@/services/assignment.services";
import { DeleteAssignmentResponse } from "@/types/assignments/assignment.response";

export function useDeleteAssignment() {
  const [loading, setLoading] = useState(false);

  const deleteAssignment = async (id: string): Promise<DeleteAssignmentResponse | null> => {
    if (loading) return null;
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

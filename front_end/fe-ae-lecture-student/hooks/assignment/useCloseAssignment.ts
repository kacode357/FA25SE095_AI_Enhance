"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AssignmentService } from "@/services/assignment.services";
import { CloseAssignmentResponse } from "@/types/assignments/assignment.response";

export function useCloseAssignment() {
  const [loading, setLoading] = useState(false);

  const closeAssignment = async (id: string): Promise<CloseAssignmentResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await AssignmentService.close(id);
      toast.success(res.message || "Assignment closed");
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { closeAssignment, loading };
}

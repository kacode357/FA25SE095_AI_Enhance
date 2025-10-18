"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AssignmentService } from "@/services/assignment.services";
import { UpdateAssignmentPayload } from "@/types/assignments/assignment.payload";
import { UpdateAssignmentResponse } from "@/types/assignments/assignment.response";

export function useUpdateAssignment() {
  const [loading, setLoading] = useState(false);

  const updateAssignment = async (
    id: string,
    payload: UpdateAssignmentPayload
  ): Promise<UpdateAssignmentResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await AssignmentService.update(id, payload);
      toast.success(res.message || "Assignment updated");
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { updateAssignment, loading };
}

"use client";

import { AssignmentService } from "@/services/assignment.services";
import { CreateAssignmentPayload } from "@/types/assignments/assignment.payload";
import { CreateAssignmentResponse } from "@/types/assignments/assignment.response";
import { useState } from "react";
import { toast } from "sonner";

export function useCreateAssignment() {
  const [loading, setLoading] = useState(false);

  const createAssignment = async (
    payload: CreateAssignmentPayload,
    suppressToast = false
  ): Promise<CreateAssignmentResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await AssignmentService.create(payload);
      if (!suppressToast) toast.success(res.message || "Assignment created");
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { createAssignment, loading };
}

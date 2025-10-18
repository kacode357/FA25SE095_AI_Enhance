"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AssignmentService } from "@/services/assignment.services";
import { CreateAssignmentPayload } from "@/types/assignments/assignment.payload";
import { CreateAssignmentResponse } from "@/types/assignments/assignment.response";

export function useCreateAssignment() {
  const [loading, setLoading] = useState(false);

  const createAssignment = async (
    payload: CreateAssignmentPayload
  ): Promise<CreateAssignmentResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await AssignmentService.create(payload);
      toast.success(res.message || "Assignment created");
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { createAssignment, loading };
}

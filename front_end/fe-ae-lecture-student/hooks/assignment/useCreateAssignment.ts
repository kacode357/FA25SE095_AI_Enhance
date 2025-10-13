"use client";

import { AssignmentService } from "@/services/assignment.services";
import { CreateAssignmentPayload } from "@/types/assignment/assignment.payload";
import { CreateAssignmentResponse } from "@/types/assignment/assignment.response";
import { useState } from "react";
import { toast } from "sonner";

export function useCreateAssignment() {
  const [loading, setLoading] = useState(false);

  const createAssignment = async (
    payload: CreateAssignmentPayload
  ): Promise<CreateAssignmentResponse | null> => {
    setLoading(true);
    try {
      const res = await AssignmentService.create(payload);
      toast.success(res.message || "Assignment created successfully");
      return res;
    } catch {
      // lỗi đã có interceptor xử lý (nếu có)
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createAssignment, loading };
}

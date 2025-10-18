"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AssignmentService } from "@/services/assignment.services";
import { ExtendDueDatePayload } from "@/types/assignments/assignment.payload";
import { ExtendDueDateResponse } from "@/types/assignments/assignment.response";

export function useExtendDueDate() {
  const [loading, setLoading] = useState(false);

  const extendDueDate = async (
    id: string,
    payload: ExtendDueDatePayload
  ): Promise<ExtendDueDateResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await AssignmentService.extendDueDate(id, payload);
      toast.success(res.message || "Due date extended");
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { extendDueDate, loading };
}

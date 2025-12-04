// hooks/assignment/useDebugActivateAssignment.ts
"use client";

import { AssignmentService } from "@/services/assignment.services";
import type { ActivateAssignmentDebugResponse } from "@/types/assignments/assignment.response";
import { useState } from "react";

export function useDebugActivateAssignment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activate = async (assignmentId: string): Promise<ActivateAssignmentDebugResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await AssignmentService.debugActivateAssignment(assignmentId);
      return res;
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Activation failed";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { activate, loading, error };
}

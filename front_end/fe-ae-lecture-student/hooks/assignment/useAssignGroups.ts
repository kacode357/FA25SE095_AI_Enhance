"use client";

import { AssignmentService } from "@/services/assignment.services";
import { AssignGroupsPayload } from "@/types/assignments/assignment.payload";
import { AssignGroupsResponse } from "@/types/assignments/assignment.response";
import { useState } from "react";
import { toast } from "sonner";

export function useAssignGroups() {
  const [loading, setLoading] = useState(false);

  const assignGroups = async (
    payload: AssignGroupsPayload,
    suppressToast = false
  ): Promise<AssignGroupsResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await AssignmentService.assignGroups(payload);
      if (!suppressToast) toast.success(res.message || "Groups assigned");
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { assignGroups, loading };
}

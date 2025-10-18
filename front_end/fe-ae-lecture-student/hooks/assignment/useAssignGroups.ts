"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AssignmentService } from "@/services/assignment.services";
import { AssignGroupsPayload } from "@/types/assignments/assignment.payload";
import { AssignGroupsResponse } from "@/types/assignments/assignment.response";

export function useAssignGroups() {
  const [loading, setLoading] = useState(false);

  const assignGroups = async (
    payload: AssignGroupsPayload
  ): Promise<AssignGroupsResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await AssignmentService.assignGroups(payload);
      toast.success(res.message || "Groups assigned");
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { assignGroups, loading };
}

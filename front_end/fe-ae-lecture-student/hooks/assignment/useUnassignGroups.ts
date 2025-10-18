"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AssignmentService } from "@/services/assignment.services";
import { UnassignGroupsPayload } from "@/types/assignments/assignment.payload";
import { UnassignGroupsResponse } from "@/types/assignments/assignment.response";

export function useUnassignGroups() {
  const [loading, setLoading] = useState(false);

  const unassignGroups = async (
    payload: UnassignGroupsPayload
  ): Promise<UnassignGroupsResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await AssignmentService.unassignGroups(payload);
      toast.success(res.message || "Groups unassigned");
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { unassignGroups, loading };
}

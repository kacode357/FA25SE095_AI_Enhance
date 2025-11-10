"use client";

import { AssignmentService } from "@/services/assignment.services";
import { ScheduleAssignmentRequest } from "@/types/assignments/assignment.payload";
import { ScheduleAssignmentResponse } from "@/types/assignments/assignment.response";
import { useState } from "react";
import { toast } from "sonner";

export function useScheduleAssignment() {
  const [loading, setLoading] = useState(false);

  const scheduleAssignment = async (
    id: string,
    payload: ScheduleAssignmentRequest
  ): Promise<ScheduleAssignmentResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await AssignmentService.scheduleAssignment(id, payload);
      toast.success(res.message || "Assignment scheduled successfully");
      return res;
    } catch (err) {
      toast.error("Failed to schedule assignment");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { scheduleAssignment, loading };
}

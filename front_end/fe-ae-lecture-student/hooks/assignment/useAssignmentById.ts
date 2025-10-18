"use client";

import { useState } from "react";
import { AssignmentService } from "@/services/assignment.services";
import { GetAssignmentByIdResponse } from "@/types/assignments/assignment.response";

export function useAssignmentById() {
  const [data, setData] = useState<GetAssignmentByIdResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAssignment = async (id: string) => {
    setLoading(true);
    try {
      const res = await AssignmentService.getById(id);
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, fetchAssignment };
}

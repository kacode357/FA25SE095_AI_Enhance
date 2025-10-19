"use client";

import { GroupService } from "@/services/group.services";
import { RandomizeGroupPayload } from "@/types/group/group.payload";
import { RandomizeGroupsResponse } from "@/types/group/group.response";
import { useState } from "react";

export function useRandomizeGroup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RandomizeGroupsResponse | null>(null);

  const randomizeGroups = async (payload: RandomizeGroupPayload) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await GroupService.randomizeGroups(payload);
      setResult(res);
      return res;
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to randomize groups";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { randomizeGroups, loading, error, result };
}

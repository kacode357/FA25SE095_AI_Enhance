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
    try {
      const res = await GroupService.randomizeGroups(payload);
      setResult(res);
      return res;
    } catch (e: any) {
      setError(e?.message || "Failed to randomize groups");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { randomizeGroups, loading, error, result };
}

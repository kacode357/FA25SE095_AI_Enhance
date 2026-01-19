"use client";

import { TopicWeightsService } from "@/services/topic-weights.services";
import { TopicWeight } from "@/types/topic/topic-weight.response";
import { useState } from "react";

export function useGetTopicWeightsByCourse() {
  const [data, setData] = useState<TopicWeight[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchByCourse = async (courseId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await TopicWeightsService.getByCourse(courseId);
      setData(res);
      return res;
    } catch (err: any) {
      setError(err?.message || "Failed to load topic weights by course");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchByCourse };
}

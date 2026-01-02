import { TopicWeightsService } from "@/services/topic-weights.services";
import { TopicWeight } from "@/types/topic/topic-weight.response";
import { useState } from "react";

export function useGetTopicWeightsByCourseCode() {
  const [data, setData] = useState<TopicWeight[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchByCourseCode = async (courseCodeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await TopicWeightsService.getByCourseCode(courseCodeId);
      setData(res);
      return res;
    } catch (err: any) {
      setError(err?.message || "Failed to load topic weights for course code");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchByCourseCode };
}

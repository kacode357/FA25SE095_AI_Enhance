import { TopicWeightsService } from "@/services/topic-weights.services";
import { GetTopicWeightsQueryParams, GetTopicWeightsResponse } from "@/types/topic/topic-weight.response";
import { useState } from "react";

export function useGetTopicWeights() {
  const [data, setData] = useState<GetTopicWeightsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTopicWeights = async (params?: GetTopicWeightsQueryParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await TopicWeightsService.getAll(params);
      setData(res);
      return res;
    } catch (err: any) {
      setError(err?.message || "Failed to load topic weights");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchTopicWeights };
}

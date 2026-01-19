import { TopicWeightsService } from "@/services/topic-weights.services";
import { TopicWeightHistoryResponse } from "@/types/topic/topic-weight.response";
import { useState } from "react";

export function useGetTopicWeightHistory() {
  const [data, setData] = useState<TopicWeightHistoryResponse[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await TopicWeightsService.getHistory(id);
      setData(res);
      return res;
    } catch (err: any) {
      setError(err?.message || "Failed to fetch topic weight history");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchHistory };
}

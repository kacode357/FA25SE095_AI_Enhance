import { TopicWeightsService } from "@/services/topic-weights.services";
import { UpdateTopicWeightBody } from "@/types/topic/topic-weight.payload";
import { TopicWeight } from "@/types/topic/topic-weight.response";
import { useState } from "react";

export function useUpdateTopicWeight() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTopicWeight = async (id: string, payload: UpdateTopicWeightBody) => {
    setLoading(true);
    setError(null);
    try {
      const res = await TopicWeightsService.update(id, payload);
      return res as TopicWeight;
    } catch (err: any) {
      setError(err?.message || "Failed to update topic weight");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, updateTopicWeight };
}

import { TopicWeightsService } from "@/services/topic-weights.services";
import { CreateTopicWeightPayload } from "@/types/topic/topic-weight.payload";
import { useState } from "react";

export function useCreateTopicWeight() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTopicWeight = async (payload: CreateTopicWeightPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await TopicWeightsService.create(payload);
      return res;
    } catch (err: any) {
      setError(err?.message || "Failed to create topic weight");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, createTopicWeight };
}

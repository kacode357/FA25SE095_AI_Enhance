import { TopicWeightsService } from "@/services/topic-weights.services";
import { BulkTopicWeightPayload } from "@/types/topic/topic-weight.payload";
import { TopicWeight } from "@/types/topic/topic-weight.response";
import { useState } from "react";

export function useBulkConfigureTopicWeights() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bulkConfigure = async (courseCodeId: string, payload: BulkTopicWeightPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await TopicWeightsService.bulkConfigure(courseCodeId, payload);
      return res as TopicWeight[];
    } catch (err: any) {
      setError(err?.message || "Failed to bulk configure topic weights");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, bulkConfigure };
}

import { TopicWeightsService } from "@/services/topic-weights.services";
import { BulkUpdateTopicWeightsPayload } from "@/types/topic/topic-weight.payload";
import { BulkUpdateTopicWeightsResponse } from "@/types/topic/topic-weight.response";
import { useState } from "react";

export function useBulkUpdateTopicWeights() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bulkUpdate = async (courseCodeId: string, payload: BulkUpdateTopicWeightsPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await TopicWeightsService.bulkUpdate(courseCodeId, payload);
      return res as BulkUpdateTopicWeightsResponse;
    } catch (err: any) {
      setError(err?.message || "Failed to bulk update topic weights");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, bulkUpdate };
}

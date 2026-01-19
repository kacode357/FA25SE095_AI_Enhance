"use client";

import { TopicWeightsService } from "@/services/topic-weights.services";
import { BulkCreateTopicWeightsByCoursePayload } from "@/types/topic/topic-weight.payload";
import { BulkCreateTopicWeightsByCourseResponse } from "@/types/topic/topic-weight.response";
import { useState } from "react";

export function useBulkCreateTopicWeights() {
  const [data, setData] = useState<BulkCreateTopicWeightsByCourseResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bulkCreate = async (courseId: string, payload: BulkCreateTopicWeightsByCoursePayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await TopicWeightsService.bulkCreate(courseId, payload);
      setData(res);
      return res;
    } catch (err: any) {
      setError(err?.message || "Failed to bulk create topic weights");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, bulkCreate };
}

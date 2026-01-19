"use client";

import { TopicWeightsService } from "@/services/topic-weights.services";
import { BulkUpdateTopicWeightsByCoursePayload } from "@/types/topic/topic-weight.payload";
import { BulkUpdateTopicWeightsResponse } from "@/types/topic/topic-weight.response";
import { useState } from "react";

export function useBulkUpdateTopicWeightsByCourse() {
  const [data, setData] = useState<BulkUpdateTopicWeightsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bulkUpdate = async (courseId: string, payload: BulkUpdateTopicWeightsByCoursePayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await TopicWeightsService.bulkUpdateByCourse(courseId, payload);
      setData(res);
      return res;
    } catch (err: any) {
      setError(err?.message || "Failed to bulk update topic weights");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, bulkUpdate };
}

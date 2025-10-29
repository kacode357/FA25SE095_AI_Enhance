import { TopicService } from "@/services/topic.services";
import { CreateTopicPayload } from "@/types/topic/topic.payload";
import { useState } from "react";

export function useCreateTopic() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTopic = async (payload: CreateTopicPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await TopicService.create(payload);
      return res;
    } catch (err: any) {
      setError(err?.message || "Failed to create topic");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, createTopic };
}
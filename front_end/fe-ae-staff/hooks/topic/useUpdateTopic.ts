import { TopicService } from "@/services/topic.services";
import { UpdateTopicPayload } from "@/types/topic/topic.payload";
import { useState } from "react";


export function useUpdateTopic() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTopic = async (topicId: string, payload: UpdateTopicPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await TopicService.update(topicId, payload);
      return res;
    } catch (err: any) {
      setError(err?.message || "Failed to update topic");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, updateTopic };
}

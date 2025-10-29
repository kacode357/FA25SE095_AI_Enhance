import { TopicService } from "@/services/topic.services";
import { useState } from "react";

export function useDeleteTopic() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteTopic = async (topicId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await TopicService.delete(topicId);
      return res;
    } catch (err: any) {
      setError(err?.message || "Failed to delete topic");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, deleteTopic };
}
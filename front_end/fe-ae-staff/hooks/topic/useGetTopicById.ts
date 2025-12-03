import { TopicService } from "@/services/topic.services";
import { GetTopicByIdResponse } from "@/types/topic/topic.response";
import { useState } from "react";


export function useGetTopicById() {
  const [data, setData] = useState<GetTopicByIdResponse["topic"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTopicById = async (topicId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await TopicService.getById(topicId);
      setData(res.topic);
      return res;
    } catch (err: any) {
      setError(err?.message || "Failed to load topic");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchTopicById };
}
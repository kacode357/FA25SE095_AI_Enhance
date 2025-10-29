import { TopicService } from "@/services/topic.services";
import { GetTopicsResponse } from "@/types/topic/topic.response";
import { useState } from "react";

interface FetchTopicsParams {
  name?: string;
  isActive?: boolean | null;
  page?: number;
  pageSize?: number;
  sortBy?: "name" | "createdAt";
  sortDirection?: "asc" | "desc";
}

export function useGetTopics() {
  const [data, setData] = useState<GetTopicsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTopics = async (params?: FetchTopicsParams) => {
    setLoading(true);
    setError(null);

    try {
      const res: GetTopicsResponse = await TopicService.getAll(params);
      setData(res);
      return res;
    } catch (err: any) {
      setError(err?.message || "Failed to load topics");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchTopics };
}

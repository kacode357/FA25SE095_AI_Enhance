import { TopicService } from "@/services/topic.services";
import { GetDropdownTopicsResponse } from "@/types/topic/topic.response";
import { useState } from "react";

export function useGetTopicsDropdown() {
  const [data, setData] = useState<GetDropdownTopicsResponse["topics"] | []>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDropdown = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await TopicService.getDropdown();
      setData(res.topics);
      return res;
    } catch (err: any) {
      setError(err?.message || "Failed to load dropdown topics");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchDropdown };
}


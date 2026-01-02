import { TopicWeightsService } from "@/services/topic-weights.services";
import { AvailableTopicForCourse } from "@/types/topic/topic-weight.response";
import { useState } from "react";

export function useGetAvailableTopicWeightsByCourse() {
  const [data, setData] = useState<AvailableTopicForCourse[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailableByCourse = async (courseId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await TopicWeightsService.getAvailableByCourse(courseId);
      setData(res);
      return res;
    } catch (err: any) {
      setError(err?.message || "Failed to load available topics for course");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchAvailableByCourse };
}

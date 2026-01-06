// services/topic-weights.services.ts
import { courseAxiosInstance } from "@/config/axios.config";
import type { GetAvailableTopicWeightsResponse } from "@/types/topic-weights/topic-weights.response";

export const TopicWeightsService = {
  /**
   * GET /TopicWeights/course/{courseId}/available
   * Get available topics (with configured weights) for a specific course
   */
  getAvailableTopics: async (courseId: string): Promise<GetAvailableTopicWeightsResponse> => {
    const res = await courseAxiosInstance.get<GetAvailableTopicWeightsResponse>(
      `/TopicWeights/course/${courseId}/available`
    );
    return res.data;
  },
};

export default TopicWeightsService;

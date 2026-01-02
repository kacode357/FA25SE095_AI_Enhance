import { courseAxiosInstance } from "@/config/axios.config";
import {
  BulkTopicWeightPayload,
  CreateTopicWeightPayload,
  UpdateTopicWeightBody
} from "@/types/topic/topic-weight.payload";
import { AvailableTopicForCourse, CreateTopicWeightResponse, GetTopicWeightsQueryParams, GetTopicWeightsResponse, TopicWeight } from "@/types/topic/topic-weight.response";

export const TopicWeightsService = {
  create: async (data: CreateTopicWeightPayload): Promise<CreateTopicWeightResponse> => {
    const response = await courseAxiosInstance.post<CreateTopicWeightResponse>("/TopicWeights", data);
    return response.data as CreateTopicWeightResponse;
  },
  getAll: async (params?: GetTopicWeightsQueryParams): Promise<GetTopicWeightsResponse> => {
    const response = await courseAxiosInstance.get<GetTopicWeightsResponse>("/TopicWeights", { params });
    return response.data as GetTopicWeightsResponse;
  },
  bulkConfigure: async (
    courseCodeId: string,
    data: BulkTopicWeightPayload
  ): Promise<TopicWeight[]> => {
    const url = `/TopicWeights/coursecode/${courseCodeId}/bulk`;
    const response = await courseAxiosInstance.post<TopicWeight[]>(url, data);
    return response.data as TopicWeight[];
  },
  update: async (id: string, data: UpdateTopicWeightBody): Promise<TopicWeight> => {
    const response = await courseAxiosInstance.put<TopicWeight>(`/TopicWeights/${id}`, data);
    return response.data as TopicWeight;
  },
  delete: async (id: string): Promise<void> => {
    // DELETE may return 204 No Content — caller should treat success by resolving without body
    await courseAxiosInstance.delete(`/TopicWeights/${id}`);
  },
  getById: async (id: string): Promise<TopicWeight> => {
    const response = await courseAxiosInstance.get<TopicWeight>(`/TopicWeights/${id}`);
    return response.data as TopicWeight;
  },
  getByCourseCode: async (courseCodeId: string): Promise<TopicWeight[]> => {
    const response = await courseAxiosInstance.get<TopicWeight[]>(`/TopicWeights/coursecode/${courseCodeId}`);
    return response.data as TopicWeight[];
  },
  getAvailableByCourse: async (courseId: string): Promise<AvailableTopicForCourse[]> => {
    const response = await courseAxiosInstance.get<AvailableTopicForCourse[]>(`/TopicWeights/course/${courseId}/available`);
    return response.data as AvailableTopicForCourse[];
  },
};

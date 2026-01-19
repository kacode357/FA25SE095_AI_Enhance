import { courseAxiosInstance } from "@/config/axios.config";
import {
  BulkCreateTopicWeightsByCoursePayload,
  BulkTopicWeightPayload,
  BulkUpdateTopicWeightsByCoursePayload,
  BulkUpdateTopicWeightsPayload,
  CreateTopicWeightPayload,
  UpdateTopicWeightBody,
} from "@/types/topic/topic-weight.payload";
import { AvailableTopicForCourse, BulkCreateTopicWeightsByCourseResponse, BulkUpdateTopicWeightsResponse, CreateTopicWeightResponse, DeleteTopicWeightResponse, GetTopicWeightsQueryParams, GetTopicWeightsResponse, TopicWeight, TopicWeightHistoryResponse } from "@/types/topic/topic-weight.response";
import { AxiosResponse } from "axios";

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
  bulkUpdate: async (
    courseCodeId: string,
    data: BulkUpdateTopicWeightsPayload
  ): Promise<BulkUpdateTopicWeightsResponse> => {
    const url = `/TopicWeights/coursecode/${courseCodeId}/bulk`;
    const response = await courseAxiosInstance.put<BulkUpdateTopicWeightsResponse>(url, data);
    return response.data as BulkUpdateTopicWeightsResponse;
  },
  bulkCreate: async (
    courseId: string,
    data: BulkCreateTopicWeightsByCoursePayload
  ): Promise<BulkCreateTopicWeightsByCourseResponse> => {
    const url = `/TopicWeights/course/${courseId}/bulk`;
    const response = await courseAxiosInstance.post<BulkCreateTopicWeightsByCourseResponse>(url, data);
    return response.data as BulkCreateTopicWeightsByCourseResponse;
  },
  bulkUpdateByCourse: async (
    courseId: string,
    data: BulkUpdateTopicWeightsByCoursePayload
  ): Promise<BulkUpdateTopicWeightsResponse> => {
    const url = `/TopicWeights/course/${courseId}/bulk`;
    const response = await courseAxiosInstance.put<BulkUpdateTopicWeightsResponse>(url, data);
    return response.data as BulkUpdateTopicWeightsResponse;
  },
  getHistory: async (id: string): Promise<TopicWeightHistoryResponse[]> => {
    const url = `/TopicWeights/${id}/history`;
    const response = await courseAxiosInstance.get<TopicWeightHistoryResponse[]>(url);
    return response.data as TopicWeightHistoryResponse[];
  },
  update: async (id: string, data: UpdateTopicWeightBody): Promise<TopicWeight> => {
    const response = await courseAxiosInstance.put<TopicWeight>(`/TopicWeights/${id}`, data);
    return response.data as TopicWeight;
  },
  delete: async (id: string): Promise<AxiosResponse<DeleteTopicWeightResponse>> => {
    const response = await courseAxiosInstance.delete<DeleteTopicWeightResponse>(`/TopicWeights/${id}`);
    return response;
  },
  getById: async (id: string): Promise<TopicWeight> => {
    const response = await courseAxiosInstance.get<TopicWeight>(`/TopicWeights/${id}`);
    return response.data as TopicWeight;
  },
  getByCourseCode: async (courseCodeId: string): Promise<TopicWeight[]> => {
    const response = await courseAxiosInstance.get<TopicWeight[]>(`/TopicWeights/coursecode/${courseCodeId}`);
    return response.data as TopicWeight[];
  },
  getByCourse: async (courseId: string): Promise<TopicWeight[]> => {
    const response = await courseAxiosInstance.get<TopicWeight[]>(`/TopicWeights/course/${courseId}`);
    return response.data as TopicWeight[];
  },
  getAvailableByCourse: async (courseId: string): Promise<AvailableTopicForCourse[]> => {
    const response = await courseAxiosInstance.get<AvailableTopicForCourse[]>(`/TopicWeights/course/${courseId}/available`);
    return response.data as AvailableTopicForCourse[];
  },
};

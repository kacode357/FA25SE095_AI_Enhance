import { courseAxiosInstance } from "@/config/axios.config";
import {
  CreateTopicPayload,
  UpdateTopicPayload,
} from "@/types/topic/topic.payload";
import {
  CreateTopicResponse,
  DeleteTopicResponse,
  GetDropdownTopicsResponse,
  GetTopicByIdResponse,
  GetTopicsResponse,
  UpdateTopicResponse,
} from "@/types/topic/topic.response";

export const TopicService = {
  create: async (data: CreateTopicPayload): Promise<CreateTopicResponse> => {
    const response = await courseAxiosInstance.post<CreateTopicResponse>("/Topics", data);
    return response.data;
  },

  getAll: async (params?: {
    name?: string;
    isActive?: boolean | null;
    page?: number;
    pageSize?: number;
    sortBy?: "name" | "createdAt";
    sortDirection?: "asc" | "desc";
  }): Promise<GetTopicsResponse> => {
    const response = await courseAxiosInstance.get<GetTopicsResponse>("/Topics", { params });
    return response.data;
  },

  getById: async (topicId: string): Promise<GetTopicByIdResponse> => {
    const response = await courseAxiosInstance.get<GetTopicByIdResponse>(`/Topics/${topicId}`);
    return response.data;
  },

  update: async (topicId: string, data: UpdateTopicPayload): Promise<UpdateTopicResponse> => {
    const response = await courseAxiosInstance.put<UpdateTopicResponse>(`/Topics/${topicId}`, data);
    return response.data;
  },

  delete: async (topicId: string): Promise<DeleteTopicResponse> => {
    const response = await courseAxiosInstance.delete<DeleteTopicResponse>(`/Topics/${topicId}`);
    return response.data;
  },

  getDropdown: async (): Promise<GetDropdownTopicsResponse> => {
    const response = await courseAxiosInstance.get<GetDropdownTopicsResponse>("/Topics/dropdown");
    return response.data;
  },
};

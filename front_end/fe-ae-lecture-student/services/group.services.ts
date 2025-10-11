import { courseAxiosInstance } from "@/config/axios.config";
import { CreateGroupPayload } from "@/types/group/group.payload";
import { CreateGroupResponse, GetGroupsByCourseIdResponse } from "@/types/group/group.response";

export const GroupService = {
  create: async (data: CreateGroupPayload): Promise<CreateGroupResponse> => {
    const response = await courseAxiosInstance.post<CreateGroupResponse>("/Groups", data);
    return response.data;
  },

  getByCourseId: async (courseId: string): Promise<GetGroupsByCourseIdResponse> => {
    const response = await courseAxiosInstance.get<GetGroupsByCourseIdResponse>(
      `/groups/courses/${courseId}`
    );
    return response.data;
  },
};



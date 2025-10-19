import { courseAxiosInstance } from "@/config/axios.config";
import { CreateGroupPayload, RandomizeGroupPayload, UpdateGroupPayload } from "@/types/group/group.payload";
import { CreateGroupResponse, DeleteGroupResponse, GetGroupsByCourseIdResponse, GroupDetail, RandomizeGroupsResponse, UpdateGroupsResponse } from "@/types/group/group.response";

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

  getById: async (groupId: string): Promise<GroupDetail> => {
    const response = await courseAxiosInstance.get<GroupDetail>(
      `/groups/${groupId}`
    );
    return response.data;
  },

  updateGroup: async (groupId: string, data: UpdateGroupPayload): Promise<UpdateGroupsResponse> => {
    const response = await courseAxiosInstance.put<UpdateGroupsResponse>(
      `/groups/${groupId}`,
      data
    );
    return response.data;
  },

    deleteGroup: async (groupId: string): Promise<DeleteGroupResponse> => {
    const response = await courseAxiosInstance.delete<DeleteGroupResponse>(
      `/groups/${groupId}`
    );
    return response.data;
  },

  randomizeGroups: async (
    payload: RandomizeGroupPayload
  ): Promise<RandomizeGroupsResponse> => {
    const response = await courseAxiosInstance.post<RandomizeGroupsResponse>(
      `/groups/randomize`,
      payload
    );
    return response.data;
  },
};



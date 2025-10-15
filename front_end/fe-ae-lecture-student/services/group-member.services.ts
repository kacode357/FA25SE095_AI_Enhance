import { courseAxiosInstance } from "@/config/axios.config";
import { AddGroupMemberPayload, DeleteGroupMemberPayload } from "@/types/group-members/group-member.payload";
import { DeleteGroupMemberResponse, GroupMembersResponse } from "@/types/group-members/group-member.response";

export const GroupMembersService = {
  getGroupMembers: async (
    groupId: string
  ): Promise<GroupMembersResponse> => {
    const response = await courseAxiosInstance.get<GroupMembersResponse>(
      `/group-members/groups/${groupId}/members`
    );
    return response.data;
  },

  addGroupMember: async (
    data: AddGroupMemberPayload
  ): Promise<GroupMembersResponse> => {
    const response = await courseAxiosInstance.post<GroupMembersResponse>(
      `/group-members`,
      data
    );
    return response.data;
  },

  deleteGroupMember: async (
    data: DeleteGroupMemberPayload
  ): Promise<DeleteGroupMemberResponse> => {
    const { groupId, studentId, reason } = data;

    const response = await courseAxiosInstance.delete<DeleteGroupMemberResponse>(
      `/group-members/groups/${groupId}/members/${studentId}`,
      {
        data: reason ? { reason } : {},
      }
    );
    return response.data;
  },
};

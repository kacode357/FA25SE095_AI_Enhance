import { courseAxiosInstance } from "@/config/axios.config";
import { AddGroupMemberPayload, AddGroupMembersPayload, DeleteGroupMemberPayload } from "@/types/group-members/group-member.payload";
import { AddGroupMembersResponse, DeleteGroupMemberResponse, GroupMembersResponse } from "@/types/group-members/group-member.response";

export const GroupMembersService = {
  getAllMembers: async (groupId: string): Promise<GroupMembersResponse> => {
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

  // ✅ Thêm nhiều thành viên cùng lúc (Lecturer only)
  addGroupMembers: async (
    data: AddGroupMembersPayload
  ): Promise<AddGroupMembersResponse> => {
    const response = await courseAxiosInstance.post<AddGroupMembersResponse>(
      `/group-members/bulk`,
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

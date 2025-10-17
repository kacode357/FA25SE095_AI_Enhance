import { courseAxiosInstance } from "@/config/axios.config";
import {
  AddGroupMemberPayload,
  AddGroupMembersPayload,
  AssignLeadPayload,
  DeleteMemberPayload,
} from "@/types/group-members/group-member.payload";
import {
  AddGroupMembersResponse,
  AssignLeaderResponse,
  DeleteMemberResponse,
  GroupMembersResponse,
} from "@/types/group-members/group-member.response";

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
    data: DeleteMemberPayload
  ): Promise<DeleteMemberResponse> => {
    const { groupId, studentId } = data;

    const response = await courseAxiosInstance.delete<DeleteMemberResponse>(
      `/group-members`,
      { params: { groupId, studentId } }
    );

    return response.data;
  },

  // ✅ Assign a member as group leader
  assignLeader: async (
    data: AssignLeadPayload
  ): Promise<AssignLeaderResponse> => {
    const { groupId, studentId } = data;
    const response = await courseAxiosInstance.put<AssignLeaderResponse>(
      `/group-members/groups/${groupId}/leader`,
      { studentId }
    );
    return response.data;
  },
};

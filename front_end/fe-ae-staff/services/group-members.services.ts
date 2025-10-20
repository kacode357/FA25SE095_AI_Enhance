// services/group-members.services.ts
import { courseAxiosInstance } from "@/config/axios.config";
import type { GetGroupMembersByGroupResponse } from "@/types/group-members/group-members.response";

export const GroupMembersService = {
  /** ✅ GET /api/group-members/groups/{groupId}/members */
  getByGroup: async (groupId: string): Promise<GetGroupMembersByGroupResponse> => {
    const res = await courseAxiosInstance.get<GetGroupMembersByGroupResponse>(
      `/group-members/groups/${groupId}/members`
    );
    return res.data;
  },
};

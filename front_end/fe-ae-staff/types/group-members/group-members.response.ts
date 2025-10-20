// types/group-members/group-members.response.ts

export interface GroupMember {
  id: string;
  groupId: string;
  groupName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  isLeader: boolean;
  role: number;          // ví dụ 1 = Member, 2 = Reviewer... tùy backend
  roleDisplay: string;   // tên hiển thị role
  joinedAt: string;      // ISO datetime
  notes: string | null;
}

/** ✅ GET /api/group-members/groups/{groupId}/members */
export interface GetGroupMembersByGroupResponse {
  success: boolean;
  message: string;
  members: GroupMember[];
}

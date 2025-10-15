export interface GroupMembersResponse {
  success: boolean;
  message: string;
  members: GroupMember[];
}

export enum MemberRole {
  Student = 0,
}

export interface GroupMember {
  id: string;
  groupId: string;
  groupName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  isLeader: boolean;
  role: MemberRole;
  roleDisplay: string;
  joinedAt: string;
  notes: string;
}

export interface DeleteGroupMemberResponse {
  success: boolean;
  message: string;
}

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

export interface DeleteMemberResponse {
  success: boolean;
  message: string;
}

//
export enum Role {
  Student = 0,
}
export interface GroupMembers {
  id: string;
  groupId: string;
  groupName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  isLeader: boolean;
  role: Role;
  roleDisplay: string;
  joinedAt: string; // ISO datetime
  notes: string;
}

export interface AddGroupMembersResultItem {
  studentId: string;
  success: boolean;
  message: string;
  member?: GroupMembers;
}

export interface AddGroupMembersResponse {
  success: boolean;
  message: string;
  totalRequested: number;
  successCount: number;
  failureCount: number;
  results: AddGroupMembersResultItem[];
}

//
export interface AssignLeaderResponse {
  success: boolean;
  message: string;
  groupId: string;
  newLeaderId: string;
  newLeaderName: string;
  previousLeaderId: string;
  previousLeaderName: string;
}

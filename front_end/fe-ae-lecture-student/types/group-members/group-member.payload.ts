export enum MemberRole {
  Student = 0,
}

export interface AddGroupMemberPayload {
  groupId: string;
  studentId: string;
  isLeader: boolean;
  role: MemberRole;
  notes?: string;
}

export interface DeleteGroupMemberPayload {
  groupId: string;
  studentId: string;
  reason?: string;
}

export interface GetAllMembersPayload {
  groupId: string;
  courseId?: string;
}


//
export interface AddGroupMembersPayload {
  groupId: string;
  studentIds: string[];
}

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

export interface DeleteMemberPayload {
  groupId: string;
  studentId: string;
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

//
export interface AssignLeadPayload {
  groupId: string;
  studentId: string;
}
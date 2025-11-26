export interface GroupDetail {
  id: string;
  courseId: string;
  courseName: string;
  name: string;
  description: string;
  maxMembers: number;
  isLocked: boolean;
  assignmentId: string;
  assignmentTitle: string;
  memberCount: number;
  leaderName: string;
  leaderId: string;
  createdAt: string;
  createdBy: string;
}

export interface CreateGroupResponse {
  success: boolean;
  message: string;
  groupId: string;
  group: GroupDetail;
}

export interface GetGroupsByCourseIdResponse {
  success: boolean;
  message: string;
  groups: GroupDetail[];
}

export interface GetGroupByIdResponse {
  success: boolean;
  message: string;
  group: GroupDetail;
}

export interface UpdateGroupsResponse {
  success: boolean;
  message: string;
  group: GroupDetail[];
}

export interface DeleteGroupResponse {
  success: true;
  message: string;
}

export interface RandomizedGroup {
  id: string;
  name: string;
  memberCount: number;
  leaderId: string;
  leaderName: string;
}

export interface RandomizeGroupsResponse {
  success: boolean;
  message: string;
  courseId: string;
  groupsCreated: number;
  studentsAssigned: number;
  groups: RandomizedGroup[];
}

export type MyGroupRole = "Leader" | "Member" | "Pending" | "Unknown" | string;

export interface MyGroupItem {
  groupId: string;
  groupName: string;
  description: string | null;
  courseId: string;
  courseName: string;
  courseCode: string;
  isLocked: boolean;
  maxMembers: number;
  memberCount: number;
  assignmentId: string | null;
  assignmentTitle: string | null;
  isLeader: boolean;
  role: MyGroupRole;
  joinedAt: string;
  createdAt: string;
}

export interface GetMyGroupsResponse {
  success: boolean;
  message: string;
  groups: MyGroupItem[];
  totalGroups: number;
}

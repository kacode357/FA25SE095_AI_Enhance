export interface CreateGroupResponse {
  success: boolean;
  message: string;
  groupId: string;
  group: GroupDetail;
}

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
  createdAt: string;     // ISO datetime
  createdBy: string;
}

export interface GetGroupsByCourseIdResponse {
  success: boolean;
  message: string;
  groups: GroupDetail[];
}

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
  createdAt: string; // ISO datetime
  createdBy: string;
}

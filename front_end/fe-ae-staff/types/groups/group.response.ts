// types/groups/group.response.ts

export interface GroupItem {
  id: string;
  courseId: string;
  courseName: string;
  name: string;
  description: string | null;
  maxMembers: number | null;
  isLocked: boolean;
  assignmentId: string | null;
  assignmentTitle: string | null;
  memberCount: number;
  leaderName: string | null;
  leaderId: string | null;
  createdAt: string;        // ISO
  createdBy: string | null; // user id
}

/** ✅ GET /api/groups/courses/{courseId} */
export interface GetGroupsByCourseResponse {
  success: boolean;
  message: string;
  groups: GroupItem[];
}

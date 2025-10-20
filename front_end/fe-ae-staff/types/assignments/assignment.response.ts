// types/assignments/assignment.response.ts

import type { AssignmentStatus } from "./assignment.payload";
import type { GroupItem } from "@/types/groups/group.response";

export interface Assignment {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  startDate: string;               // ISO
  dueDate: string;                 // ISO
  extendedDueDate: string | null;  // ISO | null
  status: AssignmentStatus;
  statusDisplay: string;
  isGroupAssignment: boolean;
  maxPoints: number;
  isOverdue: boolean;
  daysUntilDue: number;
  assignedGroupsCount: number;
  createdAt: string;               // ISO
}

export interface GetAssignmentsResponse {
  success: boolean;
  message: string;
  assignments: Assignment[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

/** ✅ Chi tiết cho GET /api/Assignments/{id} */
export interface AssignmentDetail extends Assignment {
  description: string | null;
  format: string | null;
  gradingCriteria: string | null;
  updatedAt: string;               // ISO
  assignedGroups: GroupItem[];     // từ groups API
}

export interface GetAssignmentByIdResponse {
  success: boolean;
  message: string;
  assignment: AssignmentDetail;
}

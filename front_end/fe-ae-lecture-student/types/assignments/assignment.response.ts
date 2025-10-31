// types/assignments/assignment.response.ts

// Server trả status 1-based và "Draft" ứng với 1
export enum AssignmentStatus {
  Draft = 1,
  Active = 2,
  Extended = 3,
  Overdue = 4,
  Closed = 5,
}

export interface GroupItem {
  id: string;
  courseId: string;
  courseName: string;                 // có thể rỗng ""
  name: string;
  description: string | null;
  maxMembers: number;
  isLocked: boolean;
  assignmentId: string | null;        // có thể null khi chưa gán
  assignmentTitle: string | null;
  memberCount: number;
  leaderName: string | null;
  leaderId: string | null;
  createdAt: string;
  createdBy: string | null;
}

export interface AssignmentItem {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  topicId: string;
  topicName: string;
  startDate: string;
  dueDate: string;
  extendedDueDate: string | null;
  status: AssignmentStatus;
  statusDisplay: string;
  isGroupAssignment: boolean;
  maxPoints: number;
  isOverdue: boolean;
  daysUntilDue: number;
  assignedGroupsCount: number;
  createdAt: string;
  updatedAt?: string | null;          // server có thể trả null
  description?: string;               // có thể rỗng ""
  format?: string;                    // ví dụ "PDF"
  gradingCriteria?: string;           // có thể rỗng ""
  /** Included for detailed payloads (GET by id, create, update, extend, close) */
  assignedGroups?: GroupItem[];
}

export interface GetAssignmentByIdResponse {
  success: boolean;
  message: string;
  assignment: AssignmentItem;
}

export interface UpdateAssignmentResponse {
  success: boolean;
  message: string;
  assignment: AssignmentItem;
}

export interface DeleteAssignmentResponse {
  success: boolean;
  message: string;
  groupsUnassigned: number;
}

export interface GetAssignmentsResponse {
  success: boolean;
  message: string;
  assignments: Array<
    Pick<
      AssignmentItem,
      | "id"
      | "courseId"
      | "courseName"
      | "title"
      | "topicName"
      | "startDate"
      | "dueDate"
      | "extendedDueDate"
      | "status"
      | "statusDisplay"
      | "isGroupAssignment"
      | "maxPoints"
      | "isOverdue"
      | "daysUntilDue"
      | "assignedGroupsCount"
      | "createdAt"
    >
  >;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateAssignmentResponse {
  success: boolean;
  message: string;
  assignmentId: string;
  assignment: AssignmentItem;
  groupsAssigned: number;
}

export interface GetMyAssignmentsResponse {
  success: boolean;
  message: string;
  assignments: Array<
    Pick<
      AssignmentItem,
      | "id"
      | "courseId"
      | "courseName"
      | "title"
      | "startDate"
      | "dueDate"
      | "extendedDueDate"
      | "status"
      | "statusDisplay"
      | "isGroupAssignment"
      | "maxPoints"
      | "isOverdue"
      | "daysUntilDue"
      | "assignedGroupsCount"
      | "createdAt"
    >
  >;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface ExtendDueDateResponse {
  success: boolean;
  message: string;
  assignment: AssignmentItem;
}

export interface CloseAssignmentResponse {
  success: boolean;
  message: string;
  assignment: AssignmentItem;
}

export interface AssignGroupsResponse {
  success: boolean;
  message: string;
  assignedCount: number;
  groups: GroupItem[];
}

export interface UnassignGroupsResponse {
  success: boolean;
  message: string;
  unassignedCount: number;
}

export interface GetAssignmentGroupsResponse {
  success: boolean;
  message: string;
  assignmentId: string;
  assignmentTitle: string;
  groups: GroupItem[];
  totalGroups: number;
}

export interface GetUnassignedGroupsResponse {
  success: boolean;
  message: string;
  courseId: string;
  courseName: string;
  unassignedGroups: GroupItem[];
  totalGroups: number;
  assignedGroupsCount: number;
  unassignedGroupsCount: number;
}

export interface GetGroupAssignmentLookupResponse {
  success: boolean;
  message: string;
  groupId: string;
  groupName: string;
  assignment: AssignmentItem | null;
  hasAssignment: boolean;
}

export interface GetCourseAssignmentStatsResponse {
  success: boolean;
  message: string;
  courseId: string;
  courseName: string;
  totalAssignments: number;
  byStatus: Record<string, number>;
  individualAssignments: number;
  groupAssignments: number;
  upcomingAssignments: number;
  overdueAssignments: number;
  activeAssignments: number;
  totalGroupsAssigned: number;
  assignmentsWithGroups: number;
  assignmentsWithoutGroups: number;
  earliestDueDate: string | null;
  latestDueDate: string | null;
  averageDaysUntilDue: number;
}

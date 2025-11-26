export type AssignmentStatusFilter = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface CreateAssignmentPayload {
  courseId: string;
  title: string;
  topicId: string;
  description?: string;
  startDate: string;
  dueDate: string;
  format?: string;
  gradingCriteria?: string;
  isGroupAssignment: boolean;
  maxPoints?: number;
  weight: number;
  groupIds?: string[];
}

export interface UpdateAssignmentPayload {
  title?: string;
  description?: string;
  startDate?: string;
  dueDate?: string;
  format?: string;
  gradingCriteria?: string;
  maxPoints?: number;
  weight?: number;
}

export interface GetAssignmentsQuery {
  courseId: string;
  statuses?: AssignmentStatusFilter[];
  isGroupAssignment?: boolean;
  assignedToGroupId?: string;
  hasAssignedGroups?: boolean;
  dueDateFrom?: string;
  dueDateTo?: string;
  isUpcoming?: boolean;
  isOverdue?: boolean;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: "DueDate" | "Title" | "CreatedAt" | "Status";
  sortOrder?: "asc" | "desc";
  searchQuery?: string;
}

export interface MyAssignmentsQuery {
  courseId?: string;
  statuses?: AssignmentStatusFilter[];
  isUpcoming?: boolean;
  isOverdue?: boolean;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface AssignGroupsPayload {
  assignmentId: string;
  groupIds: string[];
}

export interface UnassignGroupsPayload {
  assignmentId: string;
  groupIds: string[];
}

export interface ExtendDueDatePayload {
  extendedDueDate: string;
}

export interface ScheduleAssignmentRequest {
  schedule: boolean;
}

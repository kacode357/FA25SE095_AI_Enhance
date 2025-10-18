// types/assignments/assignment.payload.ts

/** Status filter enum: 0=Draft, 1=Active, 2=Extended, 3=Overdue, 4=Closed */
export type AssignmentStatusFilter = 0 | 1 | 2 | 3 | 4;

export interface CreateAssignmentPayload {
  courseId: string;                 // uuid
  title: string;
  description?: string;
  startDate: string;                // ISO datetime
  dueDate: string;                  // ISO datetime
  format?: string;
  gradingCriteria?: string;
  isGroupAssignment: boolean;
  maxPoints?: number;
  /** Only when isGroupAssignment = true */
  groupIds?: string[];              // uuid[]
}

export interface UpdateAssignmentPayload {
  title?: string;
  description?: string;
  startDate?: string;               // ISO
  dueDate?: string;                 // ISO
  format?: string;
  gradingCriteria?: string;
  maxPoints?: number;
}

export interface GetAssignmentsQuery {
  courseId: string; // required
  statuses?: AssignmentStatusFilter[];  // array of integers
  isGroupAssignment?: boolean;

  /** Group-related filters */
  assignedToGroupId?: string;
  hasAssignedGroups?: boolean;

  /** Date filters */
  dueDateFrom?: string; // ISO
  dueDateTo?: string;   // ISO
  isUpcoming?: boolean;
  isOverdue?: boolean;

  /** Paging + sort + search */
  pageNumber?: number;        // default 1
  pageSize?: number;          // default 10
  sortBy?: "DueDate" | "Title" | "CreatedAt" | "Status"; // default DueDate
  sortOrder?: "asc" | "desc"; // default asc
  searchQuery?: string;
}

export interface MyAssignmentsQuery {
  courseId?: string;
  statuses?: AssignmentStatusFilter[];
  isUpcoming?: boolean;
  isOverdue?: boolean;
  pageNumber?: number;      // default 1
  pageSize?: number;        // default 20
  sortBy?: string;          // default DueDate
  sortOrder?: "asc" | "desc"; // default asc
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
  extendedDueDate: string; // ISO
}

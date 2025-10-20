// types/assignments/assignment.payload.ts

export type AssignmentSortBy = "DueDate" | "Title" | "CreatedAt" | "Status";
export type SortOrder = "asc" | "desc";
/** 0=Draft, 1=Active, 2=Extended, 3=Overdue, 4=Closed */
export type AssignmentStatus = 0 | 1 | 2 | 3 | 4;

export interface GetAssignmentsQuery {
  courseId: string;
  statuses?: AssignmentStatus[];
  isGroupAssignment?: boolean;
  assignedToGroupId?: string;
  hasAssignedGroups?: boolean;
  dueDateFrom?: string;
  dueDateTo?: string;
  isUpcoming?: boolean;
  isOverdue?: boolean;
  pageNumber?: number;   // default 1
  pageSize?: number;     // default 10
  sortBy?: AssignmentSortBy; // default "DueDate"
  sortOrder?: SortOrder;     // default "asc"
  searchQuery?: string;
}

/** ✅ Path param cho GET /api/Assignments/{id} */
export interface GetAssignmentByIdPath {
  id: string;
}

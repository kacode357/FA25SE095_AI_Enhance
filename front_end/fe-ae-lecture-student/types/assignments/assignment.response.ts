export enum AssignmentStatus {
  Draft = 1,
  Scheduled = 2,
  Active = 3,
  Extended = 4,
  Overdue = 5,
  Closed = 6,
  Graded = 7,
}

export interface GroupItem {
  id: string;
  courseId: string;
  courseName: string;
  name: string;
  description: string | null;
  maxMembers: number;
  isLocked: boolean;
  assignmentId: string | null;
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
  weight: number;
  attachments: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    contentType : string;
    uploadedAt: string;
    uploadedBy: string;
  }>;
  groupIds: string[];
  isOverdue: boolean;
  daysUntilDue: number;
  assignedGroupsCount: number;
  createdAt: string;
  updatedAt?: string | null;
  description?: string;
  format?: string;
  gradingCriteria?: string;
  assignedGroups?: GroupItem[];
}

export interface AssignmentAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string; // ISO
  uploadedBy: string; // uuid
}

export interface UploadAssignmentAttachmentsResponse {
  success: boolean;
  message: string;
  uploadedFiles: AssignmentAttachment[];
  uploadedCount: number;
}

export interface DeleteAssignmentAttachmentResponse {
  success: boolean;
  message: string;
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

export interface ScheduleAssignmentResponse {
  success: boolean;
  message: string;
  assignment: Assignment;
}

export interface Assignment {
  id: string;
  courseId: string;
  courseName: string;
  topicId: string;
  topicName: string;
  title: string;
  startDate: string;
  dueDate: string;
  extendedDueDate: string;
  status: number;
  statusDisplay: string;
  isGroupAssignment: boolean;
  maxPoints: number;
  groupIds: string[];
  isOverdue: boolean;
  daysUntilDue: number;
  assignedGroupsCount: number;
  createdAt: string;
  updatedAt: string;
  description: string;
  format: string;
  gradingCriteria: string;
  assignedGroups: AssignedGroup[];
}

export interface AssignedGroup {
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

export interface StudentAssignmentGradeItem {
  assignmentId: string;
  assignmentName: string;
  dueDate: string;
  weight: number;
  score: number;
  maxPoints: number;
  percentage: number;
  weightedScore: number;
  status: string;
}

export interface StudentCourseGradeStatistics {
  completedAssignmentsCount: number;
  totalWeightedScore: number;
  totalWeightCovered: number;
  assignmentGrades: StudentAssignmentGradeItem[];
}

export interface GetStudentCourseGradesResponse {
  success: boolean;
  message: string;
  statistics: StudentCourseGradeStatistics;
}

// DEBUG ONLY: Force activate assignment immediately
export interface ActivateAssignmentDebugResponse {
  success: boolean;
  message: string;
  assignment: AssignmentItem;
  activatedAt: string; // ISO timestamp
  previousStatus: AssignmentStatus;
}

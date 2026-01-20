// types/reports/reports.response.ts

/** =======================
 *  Response DTOs
 *  ======================= */

/**
 * Backend trả status là number.
 * Nếu cần enum, define tạm và sync với BE khi có spec chính thức.
 */
// export enum ReportStatus {
//   Draft = 1,
//   Submitted = 2,
//   Graded = 3,
//   RequiresRevision = 4,
// }
export enum ReportStatus {
  Draft = 1,
  Submitted = 2,
  UnderReview = 3,
  RequiresRevision = 4,
  Resubmitted = 5,
  Graded = 6,
  Late = 7,
  Rejected = 8,
}

// Types and helpers for report history actions
export enum ReportHistoryAction {
  Created = 0,
  Updated = 1,
  Submitted = 2,
  Resubmitted = 3,
  Graded = 4,
  RevisionRequested = 5,
  Rejected = 6,
  StatusChanged = 7,
}

export interface ReportBase {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  courseId: string | null;
  courseName: string | null;

  groupId: string | null;
  groupName: string | null;

  submittedBy: string | null;
  submittedByName: string | null;
  /** ISO datetime or null if never submitted */
  submittedAt: string | null;

  /** numeric status from backend */
  status: number;

  grade: number | null;
  feedback: string | null;
  gradedBy: string | null;
  gradedByName: string | null;
  /** ISO datetime or null */
  gradedAt: string | null;

  isGroupSubmission: boolean;
  version: number;
  sequenceNumber?: number;
  fullVersion?: string;
  fileUrl: string | null;

  /** ISO datetime */
  createdAt: string;
  /** ISO datetime */
  updatedAt: string;
}

/** Returned by GET /api/Reports/{id} -> includes assignment & course details + submission */
export interface ReportDetail extends ReportBase {
  assignmentDescription: string | null;
  assignmentMaxPoints: number | null;
  assignmentDueDate: string | null; // ISO
  courseCode: string | null;
  courseName: string | null;

  submission: string; // current content
}

/** Returned inside create response */
export type ReportItem = ReportBase;

/** For list in /api/Reports/my-reports */
export type ReportListItem = ReportBase;

export interface ApiSuccess {
  success: boolean;
  message: string;
}

/** POST /api/Reports */
export interface CreateReportResponse extends ApiSuccess {
  reportId: string;
  report: ReportItem;
}

/** GET /api/Reports/{id} */
export interface GetReportResponse extends ApiSuccess {
  report: ReportDetail;
}

/** GET /api/Reports/my-reports */
export interface MyReportsResponse extends ApiSuccess {
  reports: ReportListItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface AssignmentReportsResponse extends ApiSuccess {
  reports: ReportListItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface CourseReportItem {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  groupId: string | null;
  groupName: string | null;
  submittedBy: string | null;
  submittedAt: string | null;
  status: number;
  grade: number | null;
  feedback: string | null;
  gradedBy: string | null;
  gradedAt: string | null;
  isGroupSubmission: boolean;
  version: number;
  sequenceNumber?: number;
  fullVersion?: string;
  fileUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetCourseReportsResponse {
  success: boolean;
  message: string;
  reports: CourseReportItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface RequiringGradingReportItem {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  groupId: string | null;
  groupName: string | null;
  submittedBy: string | null;
  submittedByName?: string | null;
  submittedAt: string | null;
  status: ReportStatus;
  grade: number | null;
  feedback: string | null;
  gradedBy: string | null;
  gradedByName?: string | null;
  gradedAt: string | null;
  isGroupSubmission: boolean;
  version: number;
  fileUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetReportsRequiringGradingResponse {
  success: boolean;
  message: string;
  reports: RequiringGradingReportItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface LateSubmissionReport {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  groupId: string;
  groupName: string;
  submittedBy: string;
  submittedAt: string;
  status: number;
  grade: number;
  feedback: string;
  gradedBy: string;
  gradedAt: string;
  isGroupSubmission: boolean;
  version: number;
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
  deadline: string;
  daysLate: number;
}

export interface GetLateSubmissionsResponse {
  success: boolean;
  message: string;
  reports: LateSubmissionReport[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export type GradeReportResponse = ApiSuccess;

export type RequestReportRevisionResponse = ApiSuccess;

export type RejectReportResponse = ApiSuccess;

export interface ExportAssignmentGradesResponse {
  file: Blob; // Excel file (binary)
}

export interface ReportHistoryItem {
  id: string;
  reportId: string;
  action: string;
  changedBy: string;
  changedAt: string; // ISO date
  version: number;
  comment: string;
  changes: Record<string, any>; // key-value diff
  fullVersion: string;
  changeSummary: string;
  changeDetails: string;
  unifiedDiff: string;
  contributorNames: string[];
}

export interface GetReportHistoryResponse {
  reportId: string;
  currentVersion: number;
  history: ReportHistoryItem[];

  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface GetReportHistoryVersionResponse {
  id: string;
  reportId: string;
  action: string;
  changedBy: string;
  changedAt: string; // ISO datetime
  version: number;
  comment: string;
  changes: Record<string, any>;
  changeSummary: string;
  changeDetails: string;
  unifiedDiff: string;
  contributorNames: string[];
}

export interface ReportVersionCompareItem {
  version: number;
  content: string;
  status: string;
  changedBy: string;
  changedAt: string; // ISO datetime
  action: string;
}

export interface ReportVersionFieldDiff {
  field: string;
  changed: boolean;
  oldValue: any;
  newValue: any;
}

export interface AggregatedReportVersion {
  version: number;
  fullVersionRange: string;
  sequenceCount: number;
  finalContent: string | null;
  finalStatus: string | null;
  finalGrade: number | null;
  finalFeedback: string | null;
  actionsPerformed: string[];
  contributors: string[];
  firstChangeAt: string; // ISO datetime
  lastChangeAt: string; // ISO datetime
}

export interface CompareReportVersionsResponse {
  reportId: string;
  mode: string;
  version1: ReportVersionCompareItem | null;
  version2: ReportVersionCompareItem | null;
  aggregatedVersion1?: AggregatedReportVersion | null;
  aggregatedVersion2?: AggregatedReportVersion | null;
  sequenceTimeline?: ReportTimelineItem[] | null;
  differences: ReportVersionFieldDiff[];
  unifiedDiff: string | null;
  changeSummary: string | null;
  contributorNames: string[];
}

export interface ReportTimelineItem {
  timestamp: string; // ISO datetime
  actor: string;
  action: string;
  version: number;
  sequenceNumber?: number;
  fullVersion?: string;
  details: string;
}

export interface GetReportTimelineResponse {
  reportId: string;
  timeline: ReportTimelineItem[];
}

export interface UploadReportFileResponse extends ApiSuccess {
  fileUrl: string;
  version: number;
}

/** Result returned by POST /api/Reports/ai-check */
export interface ReportAiCheckResult {
  id?: string;
  reportId: string;
  aiPercentage: number; // 0-100
  provider: string; // e.g. "ZeroGPT"
  checkedBy?: string | null; // user id
  checkedByName?: string | null; // display name
  checkedAt: string; // ISO datetime
  notes?: string | null;
  reportStatus?: number;
  studentName?: string | null;
  assignmentTitle?: string | null;
}

export interface AiCheckResponse extends ApiSuccess {
  result: ReportAiCheckResult;
}

/** GET /api/Reports/{reportId}/ai-checks */
export interface AiCheckHistoryItem {
  id: string;
  reportId: string;
  aiPercentage: number;
  provider: string;
  checkedBy?: string | null;
  checkedByName?: string | null;
  checkedAt: string; // ISO
  notes?: string | null;
  reportStatus?: number;
  studentName?: string | null;
  assignmentTitle?: string | null;
}

export interface AiCheckHistoryResponse extends ApiSuccess {
  checks: AiCheckHistoryItem[];
}

export interface UpdateReportStatusResponse extends ApiSuccess {
  newStatus: number;
}

export type RevertReportResponse = ApiSuccess;

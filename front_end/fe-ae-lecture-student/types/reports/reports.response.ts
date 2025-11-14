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

export interface ReportBase {
  id: string;
  assignmentId: string;
  assignmentTitle: string;

  groupId: string | null;
  groupName: string | null;

  submittedBy: string | null;
  /** ISO datetime or null if never submitted */
  submittedAt: string | null;

  /** numeric status from backend */
  status: number;

  grade: number | null;
  feedback: string | null;
  gradedBy: string | null;
  /** ISO datetime or null */
  gradedAt: string | null;

  isGroupSubmission: boolean;
  version: number;
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
  submittedAt: string | null;
  status: number;
  grade: number | null;
  feedback: string | null;
  gradedBy: string | null;
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

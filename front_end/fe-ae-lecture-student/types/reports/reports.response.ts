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
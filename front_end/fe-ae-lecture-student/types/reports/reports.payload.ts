// types/reports/reports.payload.ts

/** =======================
 *  Request payloads & queries
 *  ======================= */

/** POST /api/Reports */
export interface CreateReportPayload {
  assignmentId: string;      // required
  groupId?: string | null;   // optional for individual assignment
  submission: string;        // initial draft content
  isGroupSubmission: boolean;
}

/** PUT /api/Reports/{id} */
export interface UpdateReportPayload {
  submission: string;        // new content (each update increments version)
}

/** POST /api/Reports/resubmit */
export interface ResubmitReportPayload {
  reportId: string;          // target report id (must be RequiresRevision)
}

/** GET /api/Reports/my-reports */
export interface MyReportsQuery {
  courseId?: string;
  assignmentId?: string;
  /** Backend dùng number cho status; để string cho linh hoạt nếu BE nhận "Draft"... */
  status?: string;           // e.g. "Draft" | "Submitted" | ...
  pageNumber?: number;       // default 1
  pageSize?: number;         // default 20
}

export interface AssignmentReportsQuery {
  /** required in path */
  assignmentId: string;
  /** optional filters in query */
  status?: string;     // e.g. "Draft" | "Submitted" | "Graded" | ...
  pageNumber?: number; // default 1
  pageSize?: number;   // default 20
}

export interface GetCourseReportsQuery {
  courseId: string;
  status?: string; 
  fromDate?: string;
  toDate?: string; 
  pageNumber?: number;
  pageSize?: number;
}

export interface GetReportsRequiringGradingQuery {
  courseId?: string;
  assignmentId?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface GetLateSubmissionsQuery {
  courseId?: string;
  assignmentId?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface GradeReportPayload {
  reportId: string;
  grade: number;
  feedback: string;
}

export interface RequestReportRevisionPayload {
  reportId: string;
  feedback: string;
}

export interface RejectReportPayload {
  reportId: string;
  feedback: string;
}

export interface ExportAssignmentGradesParams {
  assignmentId: string;
}

export interface GetReportHistoryQuery {
  reportId: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface GetReportHistoryVersionPayload {
  reportId: string;
  version: number;
}

export interface CompareReportVersionsPayload {
  reportId: string;
  version1: number;   
  version2: number;  
}

export interface GetReportTimelinePayload {
  reportId: string; 
}

/** POST /api/Reports/ai-check */
export interface AiCheckPayload {
  reportId: string;
  notes?: string;
}

export interface UpdateReportStatusPayload {
  targetStatus: number;
  comment?: string;
}

export interface RevertReportPayload {
  reportId: string;
  version: number;
  comment: string;
}

export interface GetReportHistoryVersionPayload {
  reportId: string; // path param
  version: number;  // path param
}
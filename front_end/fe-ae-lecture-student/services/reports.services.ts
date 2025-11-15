// services/reports.services.ts
import { courseAxiosInstance as api } from "@/config/axios.config";
import type {
  AssignmentReportsQuery,
  CompareReportVersionsPayload,
  CreateReportPayload,
  GetCourseReportsQuery,
  GetLateSubmissionsQuery,
  GetReportHistoryQuery,
  GetReportHistoryVersionPayload,
  GetReportsRequiringGradingQuery,
  GradeReportPayload,
  MyReportsQuery,
  RejectReportPayload,
  RequestReportRevisionPayload,
  ResubmitReportPayload,
  UpdateReportPayload,
} from "@/types/reports/reports.payload";
import type {
  ApiSuccess,
  AssignmentReportsResponse,
  CompareReportVersionsResponse,
  CreateReportResponse,
  GetCourseReportsResponse,
  GetLateSubmissionsResponse,
  GetReportHistoryResponse,
  GetReportHistoryVersionResponse,
  GetReportResponse,
  GetReportsRequiringGradingResponse,
  GradeReportResponse,
  MyReportsResponse,
  RejectReportResponse,
  RequestReportRevisionResponse,
} from "@/types/reports/reports.response";

export const ReportsService = {
  /** ✅ POST /api/Reports — Create a draft report */
  create: async (payload: CreateReportPayload): Promise<CreateReportResponse> => {
    const res = await api.post<CreateReportResponse>("/Reports", payload);
    return res.data;
  },

  /** ✅ PUT /api/Reports/{id} — Update a draft (collab editing) */
  update: async (id: string, payload: UpdateReportPayload): Promise<ApiSuccess> => {
    const res = await api.put<ApiSuccess>(`/Reports/${id}`, payload);
    return res.data;
  },

  /** ✅ DELETE /api/Reports/{id} — Delete (only Draft/Submitted & own report) */
  delete: async (id: string): Promise<ApiSuccess> => {
    const res = await api.delete<ApiSuccess>(`/Reports/${id}`);
    return res.data;
  },

  /** ✅ GET /api/Reports/{id} — Get by ID */
  getById: async (id: string): Promise<GetReportResponse> => {
    const res = await api.get<GetReportResponse>(`/Reports/${id}`);
    return res.data;
  },

  /** ✅ POST /api/Reports/resubmit — Resubmit after revision */
  resubmit: async (payload: ResubmitReportPayload): Promise<ApiSuccess> => {
    const res = await api.post<ApiSuccess>("/Reports/resubmit", payload);
    return res.data;
  },

  /** ✅ GET /api/Reports/my-reports — Current user's reports (filters + paging) */
  getMyReports: async (query?: MyReportsQuery): Promise<MyReportsResponse> => {
    const res = await api.get<MyReportsResponse>("/Reports/my-reports", { params: query });
    return res.data;
  },
   getByAssignment: async (
    params: Omit<AssignmentReportsQuery, "assignmentId"> & { assignmentId: string }
  ): Promise<AssignmentReportsResponse> => {
    const { assignmentId, ...query } = params;
    const res = await api.get<AssignmentReportsResponse>(
      `/Reports/assignment/${assignmentId}`,
      { params: query }
    );
    return res.data;
  },

  getByCourse: async (
    params: Omit<GetCourseReportsQuery, "courseId"> & { courseId: string }
  ): Promise<GetCourseReportsResponse> => {
    const { courseId, ...query } = params;
    const res = await api.get<GetCourseReportsResponse>(
      `/Reports/course/${courseId}`,
      { params: query }
    );
    return res.data;
  },

  getRequiringGrading: async (
    query?: GetReportsRequiringGradingQuery
  ): Promise<GetReportsRequiringGradingResponse> => {
    const res = await api.get<GetReportsRequiringGradingResponse>(
      "/Reports/requiring-grading",
      { params: query }
    );
    return res.data;
  },

  getLateSubmissions: async (
    query?: GetLateSubmissionsQuery
  ): Promise<GetLateSubmissionsResponse> => {
    const res = await api.get<GetLateSubmissionsResponse>(
      "/Reports/late-submissions",
      { params: query }
    );
    return res.data;
  },

  grade: async (
    payload: GradeReportPayload
  ): Promise<GradeReportResponse> => {
    const res = await api.post<GradeReportResponse>("/Reports/grade", payload);
    return res.data;
  },

  requestRevision: async (
    payload: RequestReportRevisionPayload
  ): Promise<RequestReportRevisionResponse> => {
    const res = await api.post<RequestReportRevisionResponse>(
      "/Reports/request-revision",
      payload
    );
    return res.data;
  },

   reject: async (
    payload: RejectReportPayload
  ): Promise<RejectReportResponse> => {
    const res = await api.post<RejectReportResponse>("/Reports/reject", payload);
    return res.data;
  },

  exportAssignmentGrades: async (
    assignmentId: string
  ): Promise<Blob> => {
    const res = await api.get(`/Reports/export/${assignmentId}`, {
      responseType: "blob",
    });
    return res.data;
  },

  getHistory: async (
    params: GetReportHistoryQuery
  ): Promise<GetReportHistoryResponse> => {
    const { reportId, ...query } = params;

    const res = await api.get<GetReportHistoryResponse>(
      `/Reports/${reportId}/history`,
      { params: query }
    );

    return res.data;
  },
  
  getHistoryVersion: async (
    payload: GetReportHistoryVersionPayload
  ): Promise<GetReportHistoryVersionResponse> => {
    const { reportId, version } = payload;
    const res = await api.get<GetReportHistoryVersionResponse>(
      `/Reports/${reportId}/history/${version}`
    );
    return res.data;
  },

  compareVersions: async (
    payload: CompareReportVersionsPayload
  ): Promise<CompareReportVersionsResponse> => {
    const { reportId, version1, version2 } = payload;
    const res = await api.get<CompareReportVersionsResponse>(
      `/Reports/${reportId}/compare`,
      { params: { version1, version2 } }
    );
    return res.data;
  },

};

// services/reports.services.ts
import { courseAxiosInstance as api } from "@/config/axios.config";
import type {
  AssignmentReportsQuery,
  CreateReportPayload,
  GetCourseReportsQuery,
  GetLateSubmissionsQuery,
  GetReportsRequiringGradingQuery,
  MyReportsQuery,
  ResubmitReportPayload,
  UpdateReportPayload,
} from "@/types/reports/reports.payload";
import type {
  ApiSuccess,
  AssignmentReportsResponse,
  CreateReportResponse,
  GetCourseReportsResponse,
  GetLateSubmissionsResponse,
  GetReportResponse,
  GetReportsRequiringGradingResponse,
  MyReportsResponse,
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
};

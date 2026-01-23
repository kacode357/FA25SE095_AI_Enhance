// services/dashboard.services.ts
import { courseAxiosInstance } from "@/config/axios.config";

import type {
  DashboardTermsResponse,
  LecturerAssignmentsStatisticsResponse,
  LecturerCoursesOverviewResponse,
  LecturerPendingGradingResponse,
  LecturerStudentsPerformanceResponse,
  StudentCourseGradesDetailResponse,
  StudentCurrentCoursesResponse,
  StudentGradeBreakdownResponse,
  StudentGradesOverviewResponse,
  StudentPendingAssignmentsResponse,
  StudentPerformanceAnalyticsResponse,
} from "@/types/dashboard/dashboard.response";

import type {
  LecturerCoursesOverviewQuery,
  LecturerPendingGradingQuery,
  StudentGradesOverviewQuery,
  StudentPerformanceAnalyticsQuery,
} from "@/types/dashboard/dashboard.payload";

export const DashboardService = {
  /** GET /api/Dashboard/student/grades/overview */
  getStudentGradesOverview: async (
    params?: StudentGradesOverviewQuery
  ): Promise<StudentGradesOverviewResponse> => {
    const res = await courseAxiosInstance.get<StudentGradesOverviewResponse>(
      "/Dashboard/student/grades/overview",
      { params }
    );
    return res.data;
  },

  /** GET /api/Dashboard/student/grades/course/{courseId} */
  getStudentCourseGradesDetail: async (
    courseId: string
  ): Promise<StudentCourseGradesDetailResponse> => {
    const res =
      await courseAxiosInstance.get<StudentCourseGradesDetailResponse>(
        `/Dashboard/student/grades/course/${courseId}`
      );
    return res.data;
  },

  /** GET /api/Dashboard/student/grades/breakdown/{courseId} */
  getStudentGradeBreakdown: async (
    courseId: string
  ): Promise<StudentGradeBreakdownResponse> => {
    const res =
      await courseAxiosInstance.get<StudentGradeBreakdownResponse>(
        `/Dashboard/student/grades/breakdown/${courseId}`
      );
    return res.data;
  },

  /** GET /api/Dashboard/student/assignments/pending */
  getStudentPendingAssignments: async (termId?: string): Promise<StudentPendingAssignmentsResponse> => {
    const res =
      await courseAxiosInstance.get<StudentPendingAssignmentsResponse>(
        "/Dashboard/student/assignments/pending",
        { params: { termId } }
      );
    return res.data;
  },

  /** GET /api/Dashboard/student/courses/{termId} */
  getStudentCurrentCourses: async (termId: string): Promise<StudentCurrentCoursesResponse> => {
    const res =
      await courseAxiosInstance.get<StudentCurrentCoursesResponse>(
        `/Dashboard/student/courses/${termId}`
      );
    return res.data;
  },

  /** GET /api/Dashboard/student/analytics/performance */
  getStudentPerformanceAnalytics: async (
    params?: StudentPerformanceAnalyticsQuery
  ): Promise<StudentPerformanceAnalyticsResponse> => {
    const res =
      await courseAxiosInstance.get<StudentPerformanceAnalyticsResponse>(
        "/Dashboard/student/analytics/performance",
        { params }
      );
    return res.data;
  },

  /** GET /api/Dashboard/terms */
  getTerms: async (): Promise<DashboardTermsResponse> => {
    const res = await courseAxiosInstance.get<DashboardTermsResponse>(
      "/Dashboard/terms"
    );
    return res.data;
  },

  /** GET /api/Dashboard/lecturer/courses/overview */
  getLecturerCoursesOverview: async (
    params?: LecturerCoursesOverviewQuery
  ): Promise<LecturerCoursesOverviewResponse> => {
    const res =
      await courseAxiosInstance.get<LecturerCoursesOverviewResponse>(
        "/Dashboard/lecturer/courses/overview",
        { params }
      );
    return res.data;
  },

  /** GET /api/Dashboard/lecturer/grading/pending */
  getLecturerPendingGrading: async (
    params: LecturerPendingGradingQuery
  ): Promise<LecturerPendingGradingResponse> => {
    const res =
      await courseAxiosInstance.get<LecturerPendingGradingResponse>(
        "/Dashboard/lecturer/grading/pending",
        { params }
      );
    return res.data;
  },

  /** GET /api/Dashboard/lecturer/students/performance/{courseId} */
  getLecturerStudentsPerformance: async (
    courseId: string
  ): Promise<LecturerStudentsPerformanceResponse> => {
    const res =
      await courseAxiosInstance.get<LecturerStudentsPerformanceResponse>(
        `/Dashboard/lecturer/students/performance/${courseId}`
      );
    return res.data;
  },

  /** GET /api/Dashboard/lecturer/assignments/statistics/{courseId} */
  getLecturerAssignmentsStatistics: async (
    courseId: string
  ): Promise<LecturerAssignmentsStatisticsResponse> => {
    const res =
      await courseAxiosInstance.get<LecturerAssignmentsStatisticsResponse>(
        `/Dashboard/lecturer/assignments/statistics/${courseId}`
      );
    return res.data;
  },

  /** GET /api/Dashboard/lecturer/grades/export/{courseId} */
  exportCourseGrades: async (
    courseId: string
  ): Promise<import("@/types/dashboard/dashboard.response").ExportCourseGradesResponse | null> => {
    try {
      const res = await courseAxiosInstance.get<ArrayBuffer>(
        `/Dashboard/lecturer/grades/export/${courseId}`,
        {
          responseType: "arraybuffer",
        }
      );

      const contentDisposition =
        // axios headers may be lowercase or proper-cased
        (res.headers && (res.headers["content-disposition"] || res.headers["Content-Disposition"])) ||
        "";

      let filename = `course-grades-${courseId}.xlsx`;
      const match = /filename\*?=(?:UTF-8''?)?([^;\n]+)/i.exec(contentDisposition as string);
      if (match && match[1]) {
        try {
          filename = decodeURIComponent(match[1].trim().replace(/"/g, ""));
        } catch (e) {
          filename = match[1].trim().replace(/"/g, "");
        }
      }

      const contentType = (res.headers && (res.headers["content-type"] || res.headers["Content-Type"])) as string | undefined;
      const blob = new Blob([res.data], { type: contentType || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

      return {
        success: true,
        file: blob,
        fileName: filename,
        contentType: contentType || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      };
    } catch (err) {
      return null;
    }
  },
};

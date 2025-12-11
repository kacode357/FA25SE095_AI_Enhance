// services/dashboard.services.ts
import { courseAxiosInstance } from "@/config/axios.config";

import type {
  StudentGradesOverviewResponse,
  StudentCourseGradesDetailResponse,
  StudentPendingAssignmentsResponse,
  StudentCurrentCoursesResponse,
  StudentPerformanceAnalyticsResponse,
  LecturerCoursesOverviewResponse,
  LecturerPendingGradingResponse,
  LecturerStudentsPerformanceResponse,
  LecturerAssignmentsStatisticsResponse,
} from "@/types/dashboard/dashboard.response";

import type {
  StudentGradesOverviewQuery,
  StudentPerformanceAnalyticsQuery,
  LecturerCoursesOverviewQuery,
  LecturerPendingGradingQuery,
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

  /** GET /api/Dashboard/student/assignments/pending */
  getStudentPendingAssignments: async (): Promise<StudentPendingAssignmentsResponse> => {
    const res =
      await courseAxiosInstance.get<StudentPendingAssignmentsResponse>(
        "/Dashboard/student/assignments/pending"
      );
    return res.data;
  },

  /** GET /api/Dashboard/student/courses/current */
  getStudentCurrentCourses: async (): Promise<StudentCurrentCoursesResponse> => {
    const res =
      await courseAxiosInstance.get<StudentCurrentCoursesResponse>(
        "/Dashboard/student/courses/current"
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
};

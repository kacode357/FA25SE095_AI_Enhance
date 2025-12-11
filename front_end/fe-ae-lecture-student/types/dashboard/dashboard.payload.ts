// types/dashboard/dashboard.payload.ts

// 🔹 Student

export interface StudentGradesOverviewQuery {
  termId?: string;
}

export interface StudentPerformanceAnalyticsQuery {
  termId?: string;
}

export interface LecturerCoursesOverviewQuery {
  termId?: string;
}

export interface LecturerPendingGradingQuery {
  courseId: string;
}

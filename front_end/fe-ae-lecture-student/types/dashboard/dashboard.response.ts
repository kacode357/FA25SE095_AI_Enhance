// types/dashboard/dashboard.response.ts

// ===== COMMON =====

export interface DashboardBaseResponse<T> {
  success: boolean;
  data: T;
  generatedAt: string;
  message: string;
}

export interface GradeDistributionDto {
  aCount: number;
  bCount: number;
  cCount: number;
  dCount: number;
  fCount: number;
  ungradeCount: number;
}

// ===== STUDENT: GRADES OVERVIEW =====

export interface StudentCourseOverviewItem {
  courseId: string;
  courseName: string;
  courseCode: string;
  termName: string;
  currentGrade: number;
  letterGrade: string;
  completedAssignments: number;
  totalAssignments: number;
  completionRate: number;
}

export interface StudentGradesOverviewData {
  currentTermGpa: number;
  overallGpa: number;
  totalWeightEarned: number;
  totalWeightPossible: number;
  courses: StudentCourseOverviewItem[];
  gradeDistribution: GradeDistributionDto;
}

export type StudentGradesOverviewResponse =
  DashboardBaseResponse<StudentGradesOverviewData>;

// ===== STUDENT: COURSE GRADES DETAIL =====

export interface StudentCourseGradeAssignmentItem {
  assignmentId: string;
  title: string;
  topicName: string;
  grade: number;
  maxPoints: number;
  weight: number;
  submittedAt: string | null;
  gradedAt: string | null;
  status: string;
  feedback: string | null;
}

export interface StudentCourseGradesDetailData {
  courseId: string;
  courseName: string;
  courseCode: string;
  weightedGrade: number;
  letterGrade: string;
  assignments: StudentCourseGradeAssignmentItem[];
  topicBreakdown: Record<string, number>;
  gradeTrend: Array<{
    date: string;
    grade: number;
    assignmentTitle: string;
  }>;
  classAverage: number;
}

export type StudentCourseGradesDetailResponse =
  DashboardBaseResponse<StudentCourseGradesDetailData>;

// ===== STUDENT: PENDING ASSIGNMENTS =====

export interface PendingAssignmentItem {
  assignmentId: string;
  title: string;
  courseName: string;
  topicName: string;
  dueDate: string;
  extendedDueDate: string | null;
  hoursUntilDue: number;
  isOverdue: boolean;
  isGroupAssignment: boolean;
  groupName: string | null;
  reportStatus: string;
  reportId: string | null;
}

export interface StudentPendingAssignmentsData {
  upcomingAssignments: PendingAssignmentItem[];
  draftReports: PendingAssignmentItem[];
  revisionRequests: PendingAssignmentItem[];
  totalPending: number;
}

export type StudentPendingAssignmentsResponse =
  DashboardBaseResponse<StudentPendingAssignmentsData>;

// ===== STUDENT: CURRENT COURSES =====

export interface StudentCurrentCourseItem {
  courseId: string;
  courseName: string;
  courseCode: string;
  lecturerName: string;
  pendingAssignments: number;
  completedAssignments: number;
  totalAssignments: number;
  currentGrade: number;
  progressPercentage: number;
  courseImage: string | null;
}

export interface StudentCurrentCoursesData {
  courses: StudentCurrentCourseItem[];
  totalEnrolled: number;
  currentTermName: string;
}

export type StudentCurrentCoursesResponse =
  DashboardBaseResponse<StudentCurrentCoursesData>;

// ===== STUDENT: PERFORMANCE ANALYTICS =====

export interface StudentCoursePerformanceItem {
  courseId: string;
  courseName: string;
  averageGrade: number;
  assignmentsCompleted: number;
  assignmentsTotal: number;
  completionRate: number;
}

export interface StudentTopicPerformanceItem {
  topicName: string;
  averageGrade: number;
  assignmentsCount: number;
  performanceLevel: string;
}

export interface StudentPerformanceAnalyticsData {
  onTimeSubmissionRate: number;
  lateSubmissionRate: number;
  totalSubmissions: number;
  onTimeSubmissions: number;
  lateSubmissions: number;
  averageGrade: number;
  coursePerformance: StudentCoursePerformanceItem[];
  topicPerformance: StudentTopicPerformanceItem[];
  resubmissionRate: number;
  totalResubmissions: number;
}

export type StudentPerformanceAnalyticsResponse =
  DashboardBaseResponse<StudentPerformanceAnalyticsData>;

// ===== LECTURER: COURSES OVERVIEW =====

export interface LecturerCourseOverviewItem {
  courseId: string;
  courseName: string;
  courseCode: string;
  termName: string;
  enrollmentCount: number;
  pendingGradingCount: number;
  activeAssignmentsCount: number;
  averageCourseGrade: number;
  lastSubmissionDate: string | null;
}

export interface LecturerCoursesOverviewData {
  courses: LecturerCourseOverviewItem[];
  totalStudentsEnrolled: number;
  totalReportsPendingGrading: number;
  totalActiveAssignments: number;
}

export type LecturerCoursesOverviewResponse =
  DashboardBaseResponse<LecturerCoursesOverviewData>;

// ===== LECTURER: PENDING GRADING =====

export interface LecturerPendingReportItem {
  reportId: string;
  assignmentId: string;
  assignmentTitle: string;
  courseName: string;
  status: string;
  submittedAt: string;
  daysSinceSubmission: number;
  isGroupSubmission: boolean;
  groupName: string | null;
  submitterName: string;
  version: number;
}

export interface LecturerPendingGradingData {
  pendingReports: LecturerPendingReportItem[];
  totalPending: number;
  submittedCount: number;
  resubmittedCount: number;
}

export type LecturerPendingGradingResponse =
  DashboardBaseResponse<LecturerPendingGradingData>;

// ===== LECTURER: STUDENTS PERFORMANCE (BY COURSE) =====

export interface LecturerAssignmentPerformanceItem {
  assignmentId: string;
  title: string;
  averageGrade: number;
  submissionCount: number;
  totalStudents: number;
  submissionRate: number;
}

export interface LecturerStudentPerformanceItem {
  studentId: string;
  studentName: string;
  averageGrade: number;
  assignmentsCompleted: number;
  assignmentsTotal: number;
  lateSubmissions: number;
  riskLevel: string;
}

export interface LecturerStudentsPerformanceData {
  courseId: string;
  courseName: string;
  gradeDistribution: GradeDistributionDto;
  assignmentPerformance: LecturerAssignmentPerformanceItem[];
  topPerformers: LecturerStudentPerformanceItem[];
  atRiskStudents: LecturerStudentPerformanceItem[];
  averageCourseGrade: number;
  submissionRate: number;
  totalStudents: number;
}

export type LecturerStudentsPerformanceResponse =
  DashboardBaseResponse<LecturerStudentsPerformanceData>;

// ===== LECTURER: ASSIGNMENTS STATISTICS (BY COURSE) =====

export interface LecturerAssignmentStatisticsItem {
  assignmentId: string;
  title: string;
  topicName: string;
  totalSubmissions: number;
  expectedSubmissions: number;
  submissionRate: number;
  onTimeSubmissions: number;
  lateSubmissions: number;
  averageGrade: number;
  lowestGrade: number;
  highestGrade: number;
  difficultyLevel: string;
}

export interface LecturerAssignmentsStatisticsData {
  courseId: string;
  courseName: string;
  assignments: LecturerAssignmentStatisticsItem[];
  overallSubmissionRate: number;
  overallAverageGrade: number;
}

export type LecturerAssignmentsStatisticsResponse =
  DashboardBaseResponse<LecturerAssignmentsStatisticsData>;

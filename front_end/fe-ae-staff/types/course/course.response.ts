// types/course/course.response.ts

export interface Course {
  id: string;
  courseCode: string;
  uniqueCode: string; // ✅ Mới
  courseCodeTitle: string;
  name: string;
  description: string | null;
  term: string;
  // year: number; // Trong JSON mẫu không thấy field này, bạn có thể giữ nếu BE có trả về
  termStartDate: string | null; // ✅ Mới
  termEndDate: string | null;   // ✅ Mới
  lecturerId: string;
  lecturerName: string;
  lecturerImage: string | null; // ✅ Mới
  createdAt: string;
  enrollmentCount: number;
  status: number;
  approvedBy: string | null;
  approvedByName: string | null;
  approvedAt: string | null;
  approvalComments: string | null;
  rejectionReason: string | null;
  canEnroll: boolean;
  requiresAccessCode: boolean;
  accessCode: string | null;
  accessCodeCreatedAt: string | null;
  accessCodeExpiresAt: string | null;
  isAccessCodeExpired: boolean;
  img: string | null;          // ✅ Mới (Cover image)
  announcement: string | null; // ✅ Mới (HTML content)
  syllabusFile: string | null; // ✅ Mới
  department: string;
}

/** ✅ GET /api/Courses/all */
export interface GetAllCoursesResponse {
  success: boolean;
  message: string;
  courses: Course[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/** ✅ GET /api/Courses/{id} */
export interface GetCourseByIdResponse {
  success: boolean;
  message: string;
  course: Course;
  isEnrolled: boolean | null; // ✅ Mới: Trạng thái ghi danh của user hiện tại
}

/** ✅ PUT /api/Courses/{id}/approve */
export interface ApproveCourseResponse {
  success: boolean;
  message: string;
  course: Course;
}

/** ✅ PUT /api/Courses/{id}/reject */
export interface RejectCourseResponse {
  success: boolean;
  message: string;
  course: Course;
}

export interface Enrollment {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  studentId: string;
  studentName: string;
  joinedAt: string;
  unenrolledAt: string | null;
  status: number; // 1 = Active, 2 = Unenrolled, ...
  unenrollmentReason: string | null;
  createdAt: string;
}

/** ✅ GET /api/Courses/{id}/enrollments */
export interface GetCourseEnrollmentsResponse {
  success: boolean;
  message: string;
  course: Course;
  enrollments: Enrollment[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CourseStatistics {
  course: Course;
  totalEnrollments: number;
  totalAssignments: number;
  totalGroups: number;
  totalChatMessages: number;
  totalNotifications: number;
  recentEnrollments: number;
  lastActivity: string | null; // ISO datetime hoặc null nếu chưa có
  enrollmentsByMonth: Record<string, number>; // key: 'YYYY-MM', value: count
}

/** ✅ GET /api/Courses/{id}/statistics */
export interface GetCourseStatisticsResponse {
  success: boolean;
  message: string;
  statistics: CourseStatistics;
}
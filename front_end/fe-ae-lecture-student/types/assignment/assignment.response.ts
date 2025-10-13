export interface CreateAssignmentResponse {
  success: boolean;
  message: string;
  assignmentId: string;
  assignment: AssignmentDetail;
}

export interface AssignmentDetail {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  description: string;
  dueDate: string;           // ISO datetime
  extendedDueDate: string;   // ISO datetime
  format: string;
  gradingCriteria: string;
  createdAt: string;         // ISO datetime
}

export interface GetAssignmentsByCourseIdResponse {
  success: boolean;
  message: string;
  assignments: AssignmentDetail[];
}

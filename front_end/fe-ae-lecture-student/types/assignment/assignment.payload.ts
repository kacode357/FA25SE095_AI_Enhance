export interface CreateAssignmentPayload {
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  extendedDueDate: string;
  format: string;
  gradingCriteria: string;
}

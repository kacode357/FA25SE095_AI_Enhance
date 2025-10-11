export interface GradeItem {
  id: string;
  studentId: string;
  name: string;
  group?: string;
  score?: number;
  status: "pending" | "submitted" | "late";
}

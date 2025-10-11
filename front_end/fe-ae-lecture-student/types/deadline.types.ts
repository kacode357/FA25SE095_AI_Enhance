export interface DeadlineItem {
  id: string;
  assignment: string;
  code: string;
  original: string;
  current: string;
  extensions: number;
  status: "ongoing" | "closed";
}

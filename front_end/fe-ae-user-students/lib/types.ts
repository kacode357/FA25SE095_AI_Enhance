export type User = {
  id: string;
  name: string;
  role: "student" | "staff";
  email: string;
};

export type Class = {
  id: string;
  name: string;
  code: string; // join code
  lecturer: string;
  members: string[]; // user ids
};

export type Assignment = {
  id: string;
  classId: string;
  title: string;
  description: string;
  dueAt: string; // ISO
  type: "individual" | "group";
  maxPoints: number;
};

export type SubmissionStatus = "not_submitted" | "submitted" | "pending" | "graded" | "revision_requested";

export type Submission = {
  id: string;
  assignmentId: string;
  submittedBy: string; // user id or group id
  isGroup: boolean;
  contentUrl?: string;
  note?: string;
  updatedAt?: string;
  status: SubmissionStatus;
  grade?: number;
  feedback?: string;
};

export type Reminder = {
  id: string;
  title: string;
  dueAt: string;
  enabled: boolean;
  assignmentId?: string;
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  assignmentId?: string;
  classId?: string;
};

export type Message = {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
};

export type Thread = {
  id: string;
  name: string; // e.g., with lecturer or group
  participantIds: string[];
  lastMessageAt?: string;
};

export type AppState = {
  user: User | null;
  classes: Class[];
  assignments: Assignment[];
  submissions: Submission[];
  reminders: Reminder[];
  notifications: Notification[];
  threads: Thread[];
  messages: Message[];
};

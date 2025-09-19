import { AppState } from "./types";

export const mockState: AppState = {
  user: null, // will be set after login
  classes: [
    { id: "c1", name: "Marketing 101", code: "MKT101", lecturer: "Dr. Alice", members: ["u1"] },
    { id: "c2", name: "Business Analytics", code: "BAN201", lecturer: "Mr. Bob", members: ["u1"] },
  ],
  assignments: [
    { id: "a1", classId: "c1", title: "Market Research Report", description: "Analyze a product's market...", dueAt: new Date(Date.now() + 86400000 * 7).toISOString(), type: "group", maxPoints: 100 },
    { id: "a2", classId: "c2", title: "Dashboard KPI", description: "Build a simple KPI dashboard...", dueAt: new Date(Date.now() + 86400000 * 3).toISOString(), type: "individual", maxPoints: 10 },
  ],
  submissions: [
    { id: "s1", assignmentId: "a2", submittedBy: "u1", isGroup: false, contentUrl: "https://example.com/file1.pdf", updatedAt: new Date(Date.now() - 86400000).toISOString(), status: "graded", grade: 9.2, feedback: "Good work, refine chart titles." },
    { id: "s2", assignmentId: "a1", submittedBy: "g1", isGroup: true, note: "Initial draft", updatedAt: new Date(Date.now() - 3600_000).toISOString(), status: "revision_requested", feedback: "Expand sample size section." },
  ],
  reminders: [
    { id: "r1", title: "KPI Dashboard due", dueAt: new Date(Date.now() + 86400000 * 3).toISOString(), enabled: true, assignmentId: "a2" },
    { id: "r2", title: "Research Report", dueAt: new Date(Date.now() + 86400000 * 7).toISOString(), enabled: false, assignmentId: "a1" },
  ],
  notifications: [
    { id: "n1", title: "New Assignment", body: "Market Research Report posted.", createdAt: new Date(Date.now() - 7200_000).toISOString(), read: false, assignmentId: "a1", classId: "c1" },
    { id: "n2", title: "Grade Released", body: "KPI Dashboard graded.", createdAt: new Date(Date.now() - 3600_000 * 5).toISOString(), read: true, assignmentId: "a2", classId: "c2" },
  ],
  threads: [
    { id: "t1", name: "Chat with Dr. Alice", participantIds: ["u1", "lect1"], lastMessageAt: new Date(Date.now() - 1800_000).toISOString() },
    { id: "t2", name: "Group A - MKT101", participantIds: ["u1", "u2", "u3"], lastMessageAt: new Date(Date.now() - 3600_000 * 8).toISOString() },
  ],
  messages: [
    { id: "m1", threadId: "t1", senderId: "lect1", senderName: "Dr. Alice", content: "Please review section 2.", createdAt: new Date(Date.now() - 1700_000).toISOString() },
    { id: "m2", threadId: "t1", senderId: "u1", senderName: "You", content: "Got it, thanks!", createdAt: new Date(Date.now() - 1600_000).toISOString() },
    { id: "m3", threadId: "t2", senderId: "u2", senderName: "Minh", content: "I'll handle data collection.", createdAt: new Date(Date.now() - 3600_000 * 7.5).toISOString() },
  ],
};

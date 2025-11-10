// types/chat/chat.response.ts

/** =======================
 *  Response DTOs
 *  ======================= */

/** Item hội thoại từ GET /api/Chat/conversations */
export interface ConversationItemResponse {
  id: string;
  courseId: string | null;
  courseName: string | null;
  otherUserId: string;
  otherUserName: string;
  otherUserRole: string;
  lastMessagePreview: string | null;
  /** ISO datetime */
  lastMessageAt: string | null;
}

/** Item tin nhắn từ GET /api/Chat/conversations/{id}/messages */
export interface ChatMessageItemResponse {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  message: string;
  /** ISO datetime */
  sentAt: string;
  isDeleted: boolean;
}

/** Người dùng có thể chat trong 1 course */
export interface CourseChatUserItemResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  role: string;                 // "Student" | "Lecturer" | ...
  status: string;               // "Active" | ...
  studentId: string | null;     // Lecturer có thể null
  profilePictureUrl: string | null;
  /** ISO datetime */
  createdAt: string;
}

/** API: GET /api/Chat/courses/{courseId}/users */
export interface CourseUsersApiResponse {
  success: boolean;
  message: string;
  users: CourseChatUserItemResponse[];
}

/** Hợp nhất để code cũ vẫn chạy nếu hook trả về mảng thuần */
export type GetUsersInCourseResponse =
  | CourseUsersApiResponse
  | CourseChatUserItemResponse[];

/** Alias tiện dụng cho code cũ đang import ChatMessageDto */
export type ChatMessageDto = ChatMessageItemResponse;

export interface ConversationItemResponse {
  id: string;
  courseId: string | null;
  courseName: string | null;
  otherUserId: string;
  otherUserName: string;
  otherUserRole: string;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface ChatMessageItemResponse {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  message: string;
  sentAt: string;
  isDeleted: boolean;
<<<<<<< HEAD
  readAt: string | null; 
=======
  isRead: boolean;
  readAt: string | null;
>>>>>>> 556b7be443785ec710505f3873baa39ca8cff320
}

export interface GetMessagesApiResponse {
  success: boolean;
  message: string;
  messages: ChatMessageItemResponse[];
  isReadOnly: boolean;
  readOnlyReason: string | null;
}

export interface CourseChatUserItemResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  role: string;
  status: string;
  studentId: string | null;
  profilePictureUrl: string | null;
  createdAt: string;
  unreadCount: number;
}

export interface CourseUsersApiResponse {
  success: boolean;
  message: string;
  users: CourseChatUserItemResponse[];
}

export type GetUsersInCourseResponse =
  | CourseUsersApiResponse
  | CourseChatUserItemResponse[];

export type ChatMessageDto = ChatMessageItemResponse;

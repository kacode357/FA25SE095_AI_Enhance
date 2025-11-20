// services/chat.services.ts
import { courseAxiosInstance as api } from "@/config/axios.config";
import type { GetConversationsQuery, GetMessagesQuery } from "@/types/chat/chat.payload";
import type {
  ConversationItemResponse,
  ChatMessageItemResponse,
  CourseChatUserItemResponse,
} from "@/types/chat/chat.response";


export const ChatService = {
  /** ✅ GET /api/Chat/conversations?courseId=... */
  getConversations: async (
    params?: GetConversationsQuery
  ): Promise<ConversationItemResponse[]> => {
    const res = await api.get<ConversationItemResponse[]>("/Chat/conversations", { params });
    return res.data;
  },

  /** ✅ GET /api/Chat/conversations/{conversationId}/messages?pageNumber=&pageSize= */
  getConversationMessages: async (
    conversationId: string,
    params?: GetMessagesQuery
  ): Promise<ChatMessageItemResponse[]> => {
    const res = await api.get<ChatMessageItemResponse[]>(
      `/Chat/conversations/${conversationId}/messages`,
      { params }
    );
    return res.data;
  },

  /** ✅ GET /api/Chat/courses/{courseId}/users */
  getUsersInCourse: async (
    courseId: string
  ): Promise<CourseChatUserItemResponse[]> => {
    const res = await api.get<CourseChatUserItemResponse[]>(`/Chat/courses/${courseId}/users`);
    return res.data;
  },

  /** ✅ DELETE /api/Chat/messages/{messageId} (soft delete) */
  deleteMessage: async (messageId: string): Promise<void> => {
    await api.delete(`/Chat/messages/${messageId}`);
  },
};

// services/chat.services.ts
import { courseAxiosInstance as api } from "@/config/axios.config";
import type {
  GetConversationsQuery,
  GetMessagesQuery,
  UploadConversationCsvPayload,
} from "@/types/chat/chat.payload";
import type {
  ConversationItemResponse,
  ChatMessageItemResponse,
  CourseChatUserItemResponse,
  GetMessagesApiResponse,
  UploadConversationCsvResponse,
} from "@/types/chat/chat.response";

export const ChatService = {
  /** ✅ GET /api/Chat/conversations?courseId=... */
  getConversations: async (
    params?: GetConversationsQuery
  ): Promise<ConversationItemResponse[]> => {
    const res = await api.get<ConversationItemResponse[]>("/Chat/conversations", { params });
    return res.data;
  },

  /** ✅ GET /api/Chat/conversations/{conversationId}/messages?pageNumber=&pageSize=&supportRequestId= */
  getConversationMessages: async (
    conversationId: string,
    params?: GetMessagesQuery
  ): Promise<GetMessagesApiResponse> => {
    const res = await api.get<GetMessagesApiResponse>(
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

  /** ? POST /api/Chat/conversations/{conversationId}/upload-csv */
  uploadConversationCsv: async (
    conversationId: string,
    payload: UploadConversationCsvPayload
  ): Promise<UploadConversationCsvResponse> => {
    const formData = new FormData();
    formData.append("file", payload.file);

    const res = await api.post<UploadConversationCsvResponse>(
      `/Chat/conversations/${conversationId}/upload-csv`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  },

  /** ✅ DELETE /api/Chat/messages/{messageId} (soft delete) */
  deleteMessage: async (messageId: string): Promise<void> => {
    await api.delete(`/Chat/messages/${messageId}`);
  },
};

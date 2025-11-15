// services/crawler-chat.services.ts
import { courseAxiosInstance } from "@/config/axios.config";
import type {
  CrawlerChatMessagesQuery,
  CrawlerChatAssignmentConversationsQuery,
} from "@/types/crawler-chat/crawler-chat.payload";
import type {
  CrawlerChatMessageItem,
  CrawlerChatConversationItem,
} from "@/types/crawler-chat/crawler-chat.response";

const BASE = "/crawler-chat";

export const CrawlerChatService = {
  /**
   * GET /api/crawler-chat/assignment/{assignmentId}/messages
   * Lấy tất cả messages theo assignment
   */
  getAssignmentMessages: async (
    assignmentId: string,
    params?: CrawlerChatMessagesQuery
  ): Promise<CrawlerChatMessageItem[]> => {
    const { data } = await courseAxiosInstance.get<CrawlerChatMessageItem[]>(
      `${BASE}/assignment/${assignmentId}/messages`,
      {
        params: {
          limit: params?.limit,
          offset: params?.offset,
        },
      }
    );
    return data;
  },

  /**
   * GET /api/crawler-chat/conversation/{conversationId}/messages
   * Lấy tất cả messages theo conversation
   */
  getConversationMessages: async (
    conversationId: string,
    params?: CrawlerChatMessagesQuery
  ): Promise<CrawlerChatMessageItem[]> => {
    const { data } = await courseAxiosInstance.get<CrawlerChatMessageItem[]>(
      `${BASE}/conversation/${conversationId}/messages`,
      {
        params: {
          limit: params?.limit,
          offset: params?.offset,
        },
      }
    );
    return data;
  },

  /**
   * GET /api/crawler-chat/assignment/{assignmentId}/conversations
   * Lấy danh sách conversation của 1 assignment
   */
  getAssignmentConversations: async (
    assignmentId: string,
    params?: CrawlerChatAssignmentConversationsQuery
  ): Promise<CrawlerChatConversationItem[]> => {
    const { data } = await courseAxiosInstance.get<CrawlerChatConversationItem[]>(
      `${BASE}/assignment/${assignmentId}/conversations`,
      {
        params: {
          myOnly: params?.myOnly,
        },
      }
    );
    return data;
  },
};

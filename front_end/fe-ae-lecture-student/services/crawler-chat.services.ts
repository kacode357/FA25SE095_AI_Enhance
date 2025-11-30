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

const DEFAULT_LIMIT = 100;
const DEFAULT_OFFSET = 0;

export const CrawlerChatService = {
  /**
   * GET /api/crawler-chat/assignment/{assignmentId}/messages
   * Lấy tất cả messages theo assignment
   */
  async getAssignmentMessages(
    assignmentId: string,
    params?: CrawlerChatMessagesQuery
  ): Promise<CrawlerChatMessageItem[]> {
    const { limit = DEFAULT_LIMIT, offset = DEFAULT_OFFSET } = params ?? {};

    const { data } = await courseAxiosInstance.get<CrawlerChatMessageItem[]>(
      `${BASE}/assignment/${assignmentId}/messages`,
      {
        params: {
          limit,
          offset,
        },
      }
    );
    return data;
  },

  /**
   * GET /api/crawler-chat/conversation/{conversationId}/messages
   * Lấy tất cả messages theo conversation
   */
  async getConversationMessages(
    conversationId: string,
    params?: CrawlerChatMessagesQuery
  ): Promise<CrawlerChatMessageItem[]> {
    const { limit = DEFAULT_LIMIT, offset = DEFAULT_OFFSET } = params ?? {};

    const { data } = await courseAxiosInstance.get<CrawlerChatMessageItem[]>(
      `${BASE}/conversation/${conversationId}/messages`,
      {
        params: {
          limit,
          offset,
        },
      }
    );
    return data;
  },

  /**
   * GET /api/crawler-chat/assignment/{assignmentId}/conversations
   * Lấy danh sách conversation của 1 assignment
   */
  async getAssignmentConversations(
    assignmentId: string,
    params?: CrawlerChatAssignmentConversationsQuery
  ): Promise<CrawlerChatConversationItem[]> {
    const { myOnly } = params ?? {};

    const { data } =
      await courseAxiosInstance.get<CrawlerChatConversationItem[]>(
        `${BASE}/assignment/${assignmentId}/conversations`,
        {
          params: {
            myOnly,
          },
        }
      );
    return data;
  },
};

// types/crawler-chat/crawler-chat.response.ts

// map 1-1 với MessageType trên BE nếu có
export enum CrawlerChatMessageType {
  UserMessage = 0,
  CrawlRequest = 1,
  CrawlResult = 2,
  SystemNotification = 3,
  Visualization = 4,
  AiSummary = 5,
  FollowUpQuestion = 6,
}

/**
 * Item trả về từ:
 * - GET /api/crawler-chat/conversation/{conversationId}/messages
 * - GET /api/crawler-chat/assignment/{assignmentId}/messages (nếu có)
 */
export interface CrawlerChatMessageItem {
  messageId: string;
  conversationId: string;
  userId: string;
  userName: string;
  content: string;
  // swagger khai báo uuid nhưng thực tế BE có thể cho null => để string | null
  groupId: string | null;
  // swagger cũng là uuid, nhưng để an toàn: cho phép null
  assignmentId: string | null;
  // enum FE map số int trả về từ BE
  messageType: CrawlerChatMessageType;
  crawlJobId: string | null;
  timestamp: string;
  /** JSON string hoặc text, BE trả string -> FE để string | null */
  extractedData: string | null;
  /** JSON string hoặc text, BE trả string -> FE để string | null */
  visualizationData: string | null;
}

/**
 * Item trả về từ:
 * - GET /api/crawler-chat/assignment/{assignmentId}/conversations
 */
export interface CrawlerChatConversationItem {
  conversationId: string;
  messageCount: number;
  lastMessageAt: string;
  /** BE trả mảng (có thể rỗng) */
  participantNames: string[];
}

// types/crawler-chat/crawler-chat.response.ts

/** 1 message trong CrawlerChat */
export interface CrawlerChatMessageItem {
  messageId: string;
  conversationId: string;
  userId: string;
  userName: string;
  content: string;
  groupId: string | null;
  assignmentId: string;
  /** 0 = normal text, 1 = crawl request, ... (theo BE định nghĩa) */
  messageType: number;
  crawlJobId: string | null;
  /** ISO datetime */
  timestamp: string;
  /** BE example là "string" → để string | null cho an toàn */
  extractedData: string | null;
  visualizationData: string | null;
}

/** 1 conversation của assignment */
export interface CrawlerChatConversationItem {
  conversationId: string;
  messageCount: number;
  /** ISO datetime */
  lastMessageAt: string;
  participantNames: string[];
}

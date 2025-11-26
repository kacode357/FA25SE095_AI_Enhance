export interface CrawlerChatMessageItem {
  messageId: string;
  conversationId: string;
  userId: string;
  userName: string;
  content: string;
  groupId: string | null;
  assignmentId: string;
  messageType: number;
  crawlJobId: string | null;
  timestamp: string;
  extractedData: string | null;
  visualizationData: string | null;
}

export interface CrawlerChatConversationItem {
  conversationId: string;
  messageCount: number;
  lastMessageAt: string;
  participantNames: string[];
}

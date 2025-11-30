// types/crawler-chat/crawler-chat.payload.ts

/** Query cho list messages (assignment / conversation) */
export interface CrawlerChatMessagesQuery {
  /** Maximum number of messages to return (API default = 100) */
  limit?: number;
  /** Number of messages to skip (API default = 0) */
  offset?: number;
}

/** Query cho list conversations theo assignment */
export interface CrawlerChatAssignmentConversationsQuery {
  /**
   * If true, only return conversations the current user participated in
   * maps to ?myOnly=true|false
   */
  myOnly?: boolean;
}

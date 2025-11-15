// types/crawler-chat/crawler-chat.payload.ts

/** Query cho GET messages (assignment / conversation) */
export interface CrawlerChatMessagesQuery {
  /** default 100 */
  limit?: number;
  /** default 0 */
  offset?: number;
}

/** Query cho GET conversations của assignment */
export interface CrawlerChatAssignmentConversationsQuery {
  /** Nếu true: chỉ lấy các conversation mà user hiện tại có tham gia */
  myOnly?: boolean;
}

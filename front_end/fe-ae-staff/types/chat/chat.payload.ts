// types/chat/chat.payload.ts

export interface GetConversationsQuery {
  courseId?: string;
}
export interface GetMessagesQuery {
  pageNumber?: number;
  pageSize?: number;
}

/** Payload dùng cho Hub (SignalR) */
export interface SendMessagePayload {
  message: string;
  receiverId: string;     // GUID user
  courseId: string;       // course GUID
  conversationId?: string;
}

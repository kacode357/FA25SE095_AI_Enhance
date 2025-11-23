// types/chat/chat.payload.ts

export interface GetConversationsQuery {
  courseId?: string;
}

export interface GetMessagesQuery {
  pageNumber?: number;
  pageSize?: number;
  supportRequestId?: string;
}

/** Payload dùng cho Hub (SignalR) */
export interface SendMessagePayload {
  message: string;
  receiverId: string;   
  courseId: string;       
  conversationId?: string;
   supportRequestId?: string | null;
}

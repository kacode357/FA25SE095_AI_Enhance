// types/chat/chat.payload.ts

export interface GetConversationsQuery {
  courseId?: string;
}

export interface GetMessagesQuery {
  pageNumber?: number;
  pageSize?: number;
  supportRequestId?: string;
}

export interface UploadConversationCsvPayload {
  file: File;
}

/** Payload dA1ng cho Hub (SignalR) */
export interface SendMessagePayload {
  message: string;
  receiverId: string;
  courseId: string;
  conversationId?: string;
  supportRequestId?: string | null;
}

// types/chat.ts
export interface SendMessageDto {
  message: string;
  receiverId: string; // Guid string
  courseId: string;   // Guid string
}

export interface ChatMessageDto {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  message: string;
  sentAt: string; // ISO
  isDeleted: boolean;
}

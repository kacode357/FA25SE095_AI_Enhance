export interface SendMessageDto {
  message: string;
  receiverId: string;
  courseId: string;
}

export interface ChatMessageDto {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  message: string;
  sentAt: string;
  isDeleted: boolean;
  messageType?: string;
  crawlJobId?: string | null;
  visualizationData?: string | null;
}

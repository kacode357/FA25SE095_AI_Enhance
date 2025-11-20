"use client";

import { ChatService } from "@/services/chat.services";
import { GetMessagesQuery } from "@/types/chat/chat.payload";
import { ChatMessageItemResponse } from "@/types/chat/chat.response";
import { useState } from "react";

export function useGetConversationMessages() {
  const [loading, setLoading] = useState(false);

  const getConversationMessages = async (
    conversationId: string,
    params?: GetMessagesQuery
  ): Promise<ChatMessageItemResponse[] | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await ChatService.getConversationMessages(conversationId, params);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { getConversationMessages, loading };
}

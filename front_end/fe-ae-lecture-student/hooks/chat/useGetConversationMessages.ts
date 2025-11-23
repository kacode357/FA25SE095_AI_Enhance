// hooks/chat/useGetConversationMessages.ts
"use client";

import { useState } from "react";
import { ChatService } from "@/services/chat.services";
import { GetMessagesQuery } from "@/types/chat/chat.payload";
import {
  GetMessagesApiResponse,
} from "@/types/chat/chat.response";

export function useGetConversationMessages() {
  const [loading, setLoading] = useState(false);

  const getConversationMessages = async (
    conversationId: string,
    params?: GetMessagesQuery
  ): Promise<GetMessagesApiResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await ChatService.getConversationMessages(conversationId, params);
      // res: GetMessagesApiResponse
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { getConversationMessages, loading };
}

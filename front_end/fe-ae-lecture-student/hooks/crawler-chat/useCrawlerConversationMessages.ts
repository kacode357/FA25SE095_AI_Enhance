// hooks/crawler-chat/useCrawlerConversationMessages.ts
"use client";

import { useState } from "react";
import { CrawlerChatService } from "@/services/crawler-chat.services";
import type { CrawlerChatMessagesQuery } from "@/types/crawler-chat/crawler-chat.payload";
import type { CrawlerChatMessageItem } from "@/types/crawler-chat/crawler-chat.response";

export function useCrawlerConversationMessages() {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<CrawlerChatMessageItem[]>([]);

  const fetchConversationMessages = async (
    conversationId: string,
    args?: CrawlerChatMessagesQuery
  ): Promise<CrawlerChatMessageItem[] | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await CrawlerChatService.getConversationMessages(conversationId, args);
      setMessages(res);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchConversationMessages,
    loading,
    messages,
  };
}

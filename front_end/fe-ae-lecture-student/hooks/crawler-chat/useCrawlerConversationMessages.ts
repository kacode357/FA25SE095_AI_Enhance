// hooks/crawler-chat/useCrawlerConversationMessages.ts
"use client";

import { useCallback, useRef, useState } from "react";
import { CrawlerChatService } from "@/services/crawler-chat.services";
import type { CrawlerChatMessagesQuery } from "@/types/crawler-chat/crawler-chat.payload";
import type { CrawlerChatMessageItem } from "@/types/crawler-chat/crawler-chat.response";

export function useCrawlerConversationMessages() {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<CrawlerChatMessageItem[]>([]);
  const loadingRef = useRef(false);

  const fetchConversationMessages = useCallback(
    async (
      conversationId: string,
      args?: CrawlerChatMessagesQuery
    ): Promise<CrawlerChatMessageItem[] | null> => {
      if (loadingRef.current) return null;

      loadingRef.current = true;
      setLoading(true);
      try {
        const res = await CrawlerChatService.getConversationMessages(
          conversationId,
          args
        );
        setMessages(res);
        return res;
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [] // stable function
  );

  return {
    fetchConversationMessages,
    loading,
    messages,
  };
}

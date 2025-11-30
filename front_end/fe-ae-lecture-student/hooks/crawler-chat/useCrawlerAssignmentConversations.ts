// hooks/crawler-chat/useCrawlerAssignmentConversations.ts
"use client";

import { useCallback, useRef, useState } from "react";
import { CrawlerChatService } from "@/services/crawler-chat.services";
import type { CrawlerChatAssignmentConversationsQuery } from "@/types/crawler-chat/crawler-chat.payload";
import type { CrawlerChatConversationItem } from "@/types/crawler-chat/crawler-chat.response";

export function useCrawlerAssignmentConversations() {
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<CrawlerChatConversationItem[]>([]);
  const loadingRef = useRef(false);

  const fetchAssignmentConversations = useCallback(
    async (
      assignmentId: string,
      args?: CrawlerChatAssignmentConversationsQuery
    ): Promise<CrawlerChatConversationItem[] | null> => {
      if (loadingRef.current) return null; // đang load thì không gọi lại

      loadingRef.current = true;
      setLoading(true);
      try {
        const res = await CrawlerChatService.getAssignmentConversations(
          assignmentId,
          args
        );
        setConversations(res);
        return res;
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [] // KHÔNG phụ thuộc loading nữa -> stable function
  );

  return {
    fetchAssignmentConversations,
    loading,
    conversations,
  };
}

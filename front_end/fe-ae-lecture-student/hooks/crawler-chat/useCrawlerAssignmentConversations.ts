// hooks/crawler-chat/useCrawlerAssignmentConversations.ts
"use client";

import { useState } from "react";
import { CrawlerChatService } from "@/services/crawler-chat.services";
import type { CrawlerChatAssignmentConversationsQuery } from "@/types/crawler-chat/crawler-chat.payload";
import type { CrawlerChatConversationItem } from "@/types/crawler-chat/crawler-chat.response";

export function useCrawlerAssignmentConversations() {
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<CrawlerChatConversationItem[]>([]);

  const fetchAssignmentConversations = async (
    assignmentId: string,
    args?: CrawlerChatAssignmentConversationsQuery
  ): Promise<CrawlerChatConversationItem[] | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await CrawlerChatService.getAssignmentConversations(assignmentId, args);
      setConversations(res);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchAssignmentConversations,
    loading,
    conversations,
  };
}

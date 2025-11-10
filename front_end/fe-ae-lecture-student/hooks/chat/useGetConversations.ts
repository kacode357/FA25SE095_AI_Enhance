"use client";

import { useState } from "react";
import { ChatService } from "@/services/chat.services";
import { GetConversationsQuery } from "@/types/chat/chat.payload";
import { ConversationItemResponse } from "@/types/chat/chat.response";

export function useGetConversations() {
  const [loading, setLoading] = useState(false);

  const getConversations = async (
    params?: GetConversationsQuery
  ): Promise<ConversationItemResponse[] | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await ChatService.getConversations(params);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { getConversations, loading };
}

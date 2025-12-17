"use client";

import { useState } from "react";

import { ChatService } from "@/services/chat.services";
import type { UploadConversationCsvPayload } from "@/types/chat/chat.payload";
import type { UploadConversationCsvResponse } from "@/types/chat/chat.response";

export function useUploadConversationCsv() {
  const [loading, setLoading] = useState(false);

  const uploadConversationCsv = async (
    conversationId: string,
    payload: UploadConversationCsvPayload
  ): Promise<UploadConversationCsvResponse | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      const res = await ChatService.uploadConversationCsv(conversationId, payload);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { uploadConversationCsv, loading };
}

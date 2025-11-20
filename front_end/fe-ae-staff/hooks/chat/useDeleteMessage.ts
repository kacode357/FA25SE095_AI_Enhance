"use client";

import { ChatService } from "@/services/chat.services";
import { useState } from "react";

export function useDeleteMessage() {
  const [loading, setLoading] = useState(false);

  const deleteMessage = async (messageId: string): Promise<boolean> => {
    if (loading) return false;
    setLoading(true);
    try {
      await ChatService.deleteMessage(messageId);
      return true;
    } finally {
      setLoading(false);
    }
  };

  return { deleteMessage, loading };
}

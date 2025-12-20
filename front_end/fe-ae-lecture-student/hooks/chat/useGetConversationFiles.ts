"use client";

import { useCallback, useRef, useState } from "react";

import { ChatService } from "@/services/chat.services";
import type { ConversationFileItemResponse } from "@/types/chat/chat.response";

export function useGetConversationFiles() {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<ConversationFileItemResponse[]>([]);
  const loadingRef = useRef(false);

  const getConversationFiles = useCallback(
    async (conversationId: string): Promise<ConversationFileItemResponse[] | null> => {
      if (loadingRef.current) return null;
      loadingRef.current = true;
      setLoading(true);
      try {
        const res = await ChatService.getConversationFiles(conversationId);
        const nextFiles = Array.isArray(res?.files) ? res.files : [];
        setFiles(nextFiles);
        return nextFiles;
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    []
  );

  const clearFiles = useCallback(() => setFiles([]), []);

  return { getConversationFiles, clearFiles, loading, files };
}

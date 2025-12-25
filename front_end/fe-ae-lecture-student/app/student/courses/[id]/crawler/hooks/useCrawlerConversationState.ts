"use client";

import { useCallback, useMemo, useState } from "react";

import { MessageType } from "@/hooks/hubcrawlerchat/useCrawlerChatHub";
import { generateGuid } from "@/utils/crawler-helpers";

import type { JobHistoryEntry, UiMessage } from "../crawler-types";

type ConversationFetcher = (
  conversationId: string,
  params: { limit?: number; offset?: number }
) => Promise<any[] | null>;

type JobResultFetcher = (jobId: string) => Promise<any>;

type UseCrawlerConversationStateArgs = {
  fetchConversationMessages: ConversationFetcher;
  fetchJobResults: JobResultFetcher;
  userId?: string | number | null;
  resultsLoading: boolean;
};

export const useCrawlerConversationState = ({
  fetchConversationMessages,
  fetchJobResults,
  userId,
  resultsLoading,
}: UseCrawlerConversationStateArgs) => {
  const [conversationId, setConversationId] = useState<string>(() =>
    generateGuid()
  );
  const [selectedConversationId, setSelectedConversationId] =
    useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<UiMessage[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobHistory, setJobHistory] = useState<JobHistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const historyCount = jobHistory.length;
  const currentHistoryEntry = useMemo(() => {
    if (historyIndex < 0 || historyIndex >= historyCount) return null;
    return jobHistory[historyIndex];
  }, [historyCount, historyIndex, jobHistory]);

  const canNavigatePrev = historyIndex > 0;
  const canNavigateNext =
    historyIndex >= 0 && historyIndex < historyCount - 1;

  const mapMessagesToUi = useCallback(
    (res: any[]): UiMessage[] =>
      res.map((m) => {
        const mt = m.messageType as MessageType | undefined;
        const normalizedUserId = userId != null ? String(userId) : null;
        const isUserMessage =
          normalizedUserId !== null &&
          String(m.userId) === normalizedUserId;
        const role: UiMessage["role"] = isUserMessage
          ? "user"
          : mt === MessageType.SystemNotification
          ? "system"
          : "assistant";

        return {
          id: m.messageId,
          role,
          content: m.content,
          createdAt: m.timestamp ?? new Date().toISOString(),
          messageType: mt,
          crawlJobId: m.crawlJobId ?? undefined,
          visualizationData: m.visualizationData,
          extractedData: m.extractedData,
        };
      }),
    [userId]
  );

  const appendUiMessage = useCallback((msg: UiMessage) => {
    setChatMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === msg.id);
      if (idx === -1) return [...prev, msg];
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        ...msg,
        createdAt: msg.createdAt || updated[idx].createdAt,
      };
      return updated;
    });
  }, []);

  const reloadConversation = useCallback(
    async ({
      conversationOverride,
      jobIdOverride,
      skipHistoryUpdate = false,
    }: {
      conversationOverride?: string | null;
      jobIdOverride?: string | null;
      skipHistoryUpdate?: boolean;
    } = {}) => {
      const targetConversation = conversationOverride ?? conversationId;
      if (!targetConversation) return null;

      try {
        const res = await fetchConversationMessages(targetConversation, {
          limit: 100,
          offset: 0,
        });
        if (!res?.length) {
          setChatMessages([]);
          setActiveJobId(jobIdOverride ?? null);
          if (!skipHistoryUpdate) {
            setJobHistory([]);
            setHistoryIndex(-1);
          }
          return jobIdOverride ?? null;
        }

        const mapped = mapMessagesToUi(res);
        setChatMessages(mapped);

        const jobMessagesMap = new Map<string, JobHistoryEntry>();
        res.forEach((m) => {
          if (!m.crawlJobId) return;
          const messageType = m.messageType as MessageType | undefined;
          const summaryValue =
            typeof m.extractedData === "string"
              ? m.extractedData
              : m.extractedData
              ? JSON.stringify(m.extractedData)
              : null;
          const fallbackSummary =
            summaryValue ||
            (messageType === MessageType.AiSummary && typeof m.content === "string"
              ? m.content
              : null);
          const promptValue =
            typeof m.content === "string" ? m.content : undefined;
          const existing = jobMessagesMap.get(m.crawlJobId);
          if (existing) {
            existing.summary = existing.summary || fallbackSummary || null;
            existing.prompt = existing.prompt || promptValue;
            existing.timestamp = existing.timestamp || m.timestamp;
            return;
          }

          jobMessagesMap.set(m.crawlJobId, {
            messageId: m.messageId,
            jobId: m.crawlJobId as string,
            timestamp: m.timestamp,
            prompt: promptValue,
            summary: fallbackSummary,
          });
        });
        const jobMessages = Array.from(jobMessagesMap.values());

        if (!skipHistoryUpdate) {
          setJobHistory(jobMessages);
          if (jobMessages.length) {
            setHistoryIndex(jobMessages.length - 1);
          } else {
            setHistoryIndex(-1);
          }
        }

        const jobMsg = res.find((m) => m.crawlJobId);
        const resolvedJobId = jobIdOverride ?? jobMsg?.crawlJobId ?? null;
        setActiveJobId(resolvedJobId);
        return resolvedJobId;
      } catch {
        return null;
      }
    },
    [conversationId, fetchConversationMessages, mapMessagesToUi]
  );

  const loadHistoryEntry = useCallback(
    async (targetIndex: number) => {
      if (
        targetIndex < 0 ||
        targetIndex >= jobHistory.length ||
        resultsLoading
      ) {
        return;
      }
      const target = jobHistory[targetIndex];
      if (!target?.jobId) return;
      setHistoryIndex(targetIndex);
      setActiveJobId(target.jobId);
      await fetchJobResults(target.jobId);
    },
    [fetchJobResults, jobHistory, resultsLoading]
  );

  const handleNavigateHistory = useCallback(
    (direction: "prev" | "next") => {
      if (!jobHistory.length) return;
      const nextIndex =
        direction === "prev" ? historyIndex - 1 : historyIndex + 1;
      void loadHistoryEntry(nextIndex);
    },
    [historyIndex, jobHistory.length, loadHistoryEntry]
  );

  const handleSelectHistoryIndex = useCallback(
    (index: number) => {
      if (index === historyIndex) return;
      void loadHistoryEntry(index);
    },
    [historyIndex, loadHistoryEntry]
  );

  const startNewConversation = useCallback(() => {
    const newConversationId = generateGuid();
    setConversationId(newConversationId);
    setSelectedConversationId(newConversationId);
    setChatMessages([]);
    setActiveJobId(null);
    setJobHistory([]);
    setHistoryIndex(-1);
    return newConversationId;
  }, []);

  const selectConversation = useCallback(
    async (convId: string) => {
      if (!convId) return null;
      setConversationId(convId);
      setSelectedConversationId(convId);
      return reloadConversation({
        conversationOverride: convId,
      });
    },
    [reloadConversation]
  );

  return {
    conversationId,
    setConversationId,
    selectedConversationId,
    setSelectedConversationId,
    chatMessages,
    setChatMessages,
    appendUiMessage,
    reloadConversation,
    jobHistory,
    historyIndex,
    canNavigatePrev,
    canNavigateNext,
    currentHistoryEntry,
    activeJobId,
    setActiveJobId,
    handleSelectHistoryIndex,
    handleNavigateHistory,
    loadHistoryEntry,
    selectConversation,
    startNewConversation,
  };
};

"use client";

import { mockState } from "@/lib/mocks";
import { storage } from "@/lib/storage";
import { AppState, Submission, Thread } from "@/lib/types";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const KEY = "ae:state";

type AppContextType = AppState & {
  joinClass: (code: string) => { ok: boolean; message: string };
  submitAssignment: (payload: Partial<Submission> & { assignmentId: string }) => void;
  resubmitAssignment: (submissionId: string, patch: Partial<Submission>) => void;
  toggleReminder: (id: string, enabled: boolean) => void;
  markNotificationRead: (id: string) => void;
  sendMessage: (threadId: string, content: string, senderName: string, senderId: string) => void;
  ensureThread: (name: string, participants: string[]) => Thread;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(mockState);

  useEffect(() => {
    const cached = storage.get<AppState | null>(KEY, null);
    if (cached) setState(cached);
  }, []);

  useEffect(() => {
    storage.set(KEY, state);
  }, [state]);

  const joinClass: AppContextType["joinClass"] = (code) => {
    const found = state.classes.find((c) => c.code.toLowerCase() === code.toLowerCase());
    if (!found) return { ok: false, message: "Không tìm thấy lớp với mã này" };
    return { ok: true, message: `Đã tham gia lớp ${found.name}` };
  };

  const submitAssignment: AppContextType["submitAssignment"] = ({ assignmentId, ...rest }) => {
    const newSub: Submission = {
      id: `s_${Date.now()}`,
      assignmentId,
      submittedBy: rest.submittedBy ?? "u1",
      isGroup: !!rest.isGroup,
      contentUrl: rest.contentUrl,
      note: rest.note,
      updatedAt: new Date().toISOString(),
      status: "pending",
    };
    setState((s) => ({ ...s, submissions: [...s.submissions, newSub] }));
  };

  const resubmitAssignment: AppContextType["resubmitAssignment"] = (submissionId, patch) => {
    setState((s) => ({
      ...s,
      submissions: s.submissions.map((sub) =>
        sub.id === submissionId ? { ...sub, ...patch, status: "pending", updatedAt: new Date().toISOString() } : sub
      ),
    }));
  };

  const toggleReminder: AppContextType["toggleReminder"] = (id, enabled) => {
    setState((s) => ({
      ...s,
      reminders: s.reminders.map((r) => (r.id === id ? { ...r, enabled } : r)),
    }));
  };

  const markNotificationRead: AppContextType["markNotificationRead"] = (id) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  const ensureThread: AppContextType["ensureThread"] = (name, participants) => {
    const existing = state.threads.find((t) => t.name === name);
    if (existing) return existing;
    const newThread: Thread = { id: `t_${Date.now()}`, name, participantIds: participants };
    setState((s) => ({ ...s, threads: [newThread, ...s.threads] }));
    return newThread;
  };

  const sendMessage: AppContextType["sendMessage"] = (threadId, content, senderName, senderId) => {
    const msg = {
      id: `m_${Date.now()}`,
      threadId,
      senderId,
      senderName,
      content,
      createdAt: new Date().toISOString(),
    };
    setState((s) => ({ ...s, messages: [...s.messages, msg] }));
  };

  const value: AppContextType = useMemo(
    () => ({
      ...state,
      joinClass,
      submitAssignment,
      resubmitAssignment,
      toggleReminder,
      markNotificationRead,
      sendMessage,
      ensureThread,
    }),
    [state]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

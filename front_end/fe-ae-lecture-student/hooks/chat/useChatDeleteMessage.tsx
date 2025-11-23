"use client";

import { useState } from "react";
import { useDeleteMessage } from "@/hooks/chat/useDeleteMessage";
import type { ChatMessageItemResponse as ChatMessage } from "@/types/chat/chat.response";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Options = {
  currentUserId: string | null;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  deleteMessageHub?: (id: string) => Promise<void> | void;
};

export function useChatDeleteMessage({
  currentUserId,
  setMessages,
  deleteMessageHub,
}: Options) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const { deleteMessage, loading: deleting } = useDeleteMessage();

  const requestDelete = (id: string) => {
    setConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    const id = confirmId;
    if (!id) return;

    // check có phải tin của mình không
    let isMine = false;
    setMessages((prev) => {
      isMine = !!prev.find(
        (m) => m.id === id && m.senderId === currentUserId,
      );
      return prev;
    });

    if (!isMine || deleting) {
      setConfirmId(null);
      return;
    }

    const ok = await deleteMessage(id);
    if (!ok) return;

    // update local state
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, isDeleted: true, message: "[deleted]" } : m,
      ),
    );

    // bắn lên hub nếu có
    try {
      await deleteMessageHub?.(id);
    } catch {
      /* ignore */
    }

    setConfirmId(null);
  };

  const ConfirmDialog = (
    <AlertDialog
      open={!!confirmId}
      onOpenChange={(open) => {
        if (!open) setConfirmId(null);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this message?</AlertDialogTitle>
          <AlertDialogDescription>
            This action can’t be undone. The message will be marked as deleted
            for everyone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={handleConfirmDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return {
    requestDelete,
    ConfirmDialog,
    deleting,
  };
}

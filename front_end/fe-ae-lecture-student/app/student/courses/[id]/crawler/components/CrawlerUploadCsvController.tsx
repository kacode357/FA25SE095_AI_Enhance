"use client";

import { useCallback, type ReactNode } from "react";
import { toast } from "sonner";

import { useUploadConversationCsv } from "@/hooks/chat/useUploadConversationCsv";

type ReloadConversationArgs = {
  conversationOverride?: string | null;
  jobIdOverride?: string | null;
  skipHistoryUpdate?: boolean;
};

type Props = {
  conversationId: string | null;
  reloadConversation: (args?: ReloadConversationArgs) => Promise<string | null>;
  children: (props: {
    onUploadCsv: (file: File) => Promise<void>;
    uploadingCsv: boolean;
  }) => ReactNode;
};

const CrawlerUploadCsvController = ({
  conversationId,
  reloadConversation,
  children,
}: Props) => {
  const {
    uploadConversationCsv,
    loading: uploadingCsv,
  } = useUploadConversationCsv();

  const handleUploadConversationCsv = useCallback(
    async (file: File) => {
      if (!file) return;
      if (!conversationId) {
        toast.error("Conversation is not ready. Please try again.");
        return;
      }

      try {
        const res = await uploadConversationCsv(conversationId, { file });
        if (!res) {
          toast.error("Upload already in progress. Please wait.");
          return;
        }

        const segments: string[] = [];
        if (typeof res.rowCount === "number") {
          segments.push(`${res.rowCount} rows`);
        }
        if (res.columnNames?.length) {
          const columnPreview = res.columnNames.slice(0, 4).join(", ");
          segments.push(
            `Columns: ${columnPreview}${res.columnNames.length > 4 ? "..." : ""}`
          );
        }

        toast.success(res.message || `Uploaded ${res.fileName || file.name}`, {
          description: segments.length ? segments.join(" - ") : undefined,
        });

        await reloadConversation({ conversationOverride: conversationId });
      } catch (err: any) {
        toast.error(err?.message || "Failed to upload CSV file");
      }
    },
    [conversationId, reloadConversation, uploadConversationCsv]
  );

  return (
    <>
      {children({
        onUploadCsv: handleUploadConversationCsv,
        uploadingCsv,
      })}
    </>
  );
};

export default CrawlerUploadCsvController;

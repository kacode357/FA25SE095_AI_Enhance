"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// Components
import ConfigureTopicWeightsDialog from "./ConfigureTopicWeightsDialog";

// Hooks & Types
import { useAuth } from "@/contexts/AuthContext";
import { useBulkUpdateTopicWeights } from "@/hooks/topic/useBulkUpdateTopicWeights";
import { useGetTopics } from "@/hooks/topic/useGetTopics";
import { TopicWeight } from "@/types/topic/topic-weight.response";

type Props = {
  courseCodeId?: string;
  data?: TopicWeight[] | null;
  fetchByCourseCode: (id: string) => Promise<TopicWeight[] | null>;
};

type Row = {
  topicId?: string | null;
  topicName?: string | null;
  weightPercentage?: number | null;
  description?: string | null;
};

export default function ConfigureTopicWeightsButton({
  courseCodeId,
  data,
  fetchByCourseCode,
}: Props) {
  // Hooks
  const { data: topicsResp, fetchTopics } = useGetTopics();
  const topics = topicsResp?.topics || [];
  
  const { bulkUpdate, loading, error } = useBulkUpdateTopicWeights();
  const { user } = useAuth();

  // Local State
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);

  // Init Data when dialog opens
  useEffect(() => {
    if (open) {
      fetchTopics();
      if (data && data.length > 0) {
        setRows(
          data.map((d) => ({
            topicId: d.topicId,
            topicName: d.topicName ?? null,
            weightPercentage: d.weightPercentage ?? null,
            description: d.description ?? null,
          }))
        );
      } else {
        setRows([
          {
            topicId: null,
            topicName: null,
            weightPercentage: null,
            description: null,
          },
        ]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // UI Calculations (Visual feedback only)
  const totalWeight = useMemo(() => {
    return rows.reduce((acc, curr) => acc + (curr.weightPercentage || 0), 0);
  }, [rows]);

  const isValidTotal = totalWeight === 100;

  const selectedTopicIds = useMemo(
    () => rows.map((r) => r.topicId).filter(Boolean) as string[],
    [rows]
  );

  // Row Actions
  const addRow = () =>
    setRows((prev) => [
      ...prev,
      {
        topicId: null,
        topicName: null,
        weightPercentage: null,
        description: null,
      },
    ]);

  const updateRow = (index: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  const removeRow = (index: number) =>
    setRows((prev) => prev.filter((_, i) => i !== index));

  // --- REFACTORED SUBMIT LOGIC ---
  const handleSubmit = async () => {
    if (!courseCodeId) return;

    // Chuẩn bị payload
    const items = rows
      .filter((r) => r.topicId) // Lọc các dòng rỗng UI để tránh lỗi JSON format
      .map((r) => ({
        topicId: r.topicId!,
        weightPercentage: r.weightPercentage ?? 0,
        description: r.description ?? null,
      }));

    const payload = {
      courseCodeId,
      configuredBy: user?.id ?? "",
      changeReason: "Configured via UI",
      weights: items,
    };

    // Gọi API qua hook
    const res = await bulkUpdate(courseCodeId, payload);

    // Xử lý kết quả dựa trên message từ BE
    if (res?.success) {
      toast.success(res.message); // Message thành công từ BE
      setOpen(false);
      // Refresh data ngầm, không cần await block UI
      fetchByCourseCode(courseCodeId).catch(() => {});
    } else {
      // Don't emit an error toast here to avoid duplicate notifications.
      // Errors should be surfaced by a single, centralized handler.
      // Keep a console log for debugging.
      // eslint-disable-next-line no-console
      throw Error;
    }
  };

  return (
    <ConfigureTopicWeightsDialog
      open={open}
      setOpen={setOpen}
      rows={rows}
      addRow={addRow}
      updateRow={updateRow}
      removeRow={removeRow}
      topics={topics}
      selectedTopicIds={selectedTopicIds}
      totalWeight={totalWeight}
      isValidTotal={isValidTotal}
      loading={loading}
      handleSubmit={handleSubmit}
    />
  );
}
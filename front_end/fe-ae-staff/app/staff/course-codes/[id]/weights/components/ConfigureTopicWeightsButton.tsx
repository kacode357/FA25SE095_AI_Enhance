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
  const { data: topicsResp, fetchTopics } = useGetTopics();
  const topics = topicsResp?.topics || [];

  const { bulkUpdate, loading, error } = useBulkUpdateTopicWeights();
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);

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

  // Tính tổng % realtime
  const totalWeight = useMemo(() => {
    return rows.reduce((acc, curr) => acc + (curr.weightPercentage || 0), 0);
  }, [rows]);

  const isValidTotal = totalWeight === 100;

  const selectedTopicIds = useMemo(
    () => rows.map((r) => r.topicId).filter(Boolean) as string[],
    [rows]
  );

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

  const handleSubmit = async () => {
    if (!courseCodeId) {
      toast.error("Missing course code id");
      return;
    }

    const items = rows
      .filter((r) => r.topicId)
      .map((r) => ({
        topicId: r.topicId!,
        weightPercentage: r.weightPercentage ?? 0,
        description: r.description ?? null,
      }));

    if (items.length === 0) {
      toast.error("Please select at least one topic");
      return;
    }

    const payload = {
      courseCodeId,
      configuredBy: user?.id ?? "",
      changeReason: "Configured via UI",
      updates: items,
    };

    const res = await bulkUpdate(courseCodeId, payload as any);
    if (res && res.success) {
      toast.success(res.message || "Topic weights configured successfully");
      setOpen(false);
      try {
        await fetchByCourseCode(courseCodeId);
      } catch (e) {}
    } else {
      if (res && res.errors && res.errors.length > 0) {
        toast.error(res.errors.join(", "));
      } else {
        toast.error(error || "Failed to configure topic weights");
      }
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
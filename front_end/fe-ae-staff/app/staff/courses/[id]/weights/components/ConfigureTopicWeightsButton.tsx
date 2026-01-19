"use client";

import { useGetTopics } from "@/hooks/topic/useGetTopics";
import { TopicWeight } from "@/types/topic/topic-weight.response";
import { useEffect, useMemo, useState } from "react";
import ConfigureTopicWeightsDialog from "./ConfigureTopicWeightsDialog";

type Props = {
    courseId?: string;
    data?: TopicWeight[] | null;
    fetchByCourse: (id: string) => Promise<TopicWeight[] | null>;
};

type Row = {
    topicId?: string | null;
    topicName?: string | null;
    weightPercentage?: number | null;
    description?: string | null;
};

export default function ConfigureTopicWeightsButton({
    courseId,
    data,
    fetchByCourse,
}: Props) {
    const { data: topicsResp, fetchTopics } = useGetTopics();
    const topics = topicsResp?.topics || [];

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

    // dialog will perform create/update itself; pass courseId and existing data
    const handleSuccess = () => {
        if (courseId) fetchByCourse(courseId);
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
            courseId={courseId}
            existingTopicWeights={data ?? undefined}
            onSuccess={handleSuccess}
        />
    );
}

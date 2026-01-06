"use client";

import { TopicWeightsService } from "@/services/topic-weights.services";
import type { AvailableTopicWeight } from "@/types/topic-weights/topic-weights.response";
import { useCallback, useState } from "react";

export function useAvailableTopicWeights() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<AvailableTopicWeight[] | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const fetch = useCallback(async (courseId: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await TopicWeightsService.getAvailableTopics(courseId);
            setData(res.topics);
            return res.topics;
        } catch (err) {
            setError(err as Error);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    return { loading, data, error, fetch, reset } as const;
}

export default useAvailableTopicWeights;

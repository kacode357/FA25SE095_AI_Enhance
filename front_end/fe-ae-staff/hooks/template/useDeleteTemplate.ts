"use client";

import { TemplateService } from "@/services/template.services";
import type { DeleteTemplateResponse } from "@/types/template/template.response";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function useDeleteTemplate() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<DeleteTemplateResponse | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const remove = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await TemplateService.delete(id);
            setResult(res);
            if (res?.success) {
                toast.success(res.message || "Template deleted successfully");
            } else {
                toast.error(res?.message || "Failed to delete template");
            }
            return res;
        } catch (err) {
            setError(err as Error);
            toast.error((err as Error)?.message || "Failed to delete template");
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setResult(null);
        setError(null);
        setLoading(false);
    }, []);

    return { loading, result, error, remove, reset } as const;
}

export default useDeleteTemplate;

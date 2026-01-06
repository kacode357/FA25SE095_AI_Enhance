"use client";

import { TemplateService } from "@/services/template.services";
import type { TemplateMetadata } from "@/types/template/template.response";
import { useCallback, useState } from "react";

export function useTemplateMetadata() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TemplateMetadata | TemplateMetadata[] | null>(
    null
  );
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async (isActive?: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const res = await TemplateService.getMetadata(isActive);
      setData(res as any);
      return res;
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

export default useTemplateMetadata;

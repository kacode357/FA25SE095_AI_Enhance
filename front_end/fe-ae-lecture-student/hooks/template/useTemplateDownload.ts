"use client";

import { TemplateService } from "@/services/template.services";
import { useCallback, useState } from "react";

export function useTemplateDownload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const download = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await TemplateService.download();
      return result;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, download } as const;
}

export default useTemplateDownload;

"use client";

import { TemplateService } from "@/services/template.services";
import { useCallback, useState } from "react";

export function useTemplateDownload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const download = useCallback(async (id?: string) => {
    setLoading(true);
    setError(null);

    if (!id) {
      const e = new Error("Template id is required");
      setError(e);
      setLoading(false);
      return null;
    }

    try {
      const result = await TemplateService.download(id);
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

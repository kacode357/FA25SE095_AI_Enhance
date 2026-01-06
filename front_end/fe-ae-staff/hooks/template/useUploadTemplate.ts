"use client";

import { TemplateService } from "@/services/template.services";
import type { UploadTemplateResponse } from "@/types/template/template.response";
import { useCallback, useState } from "react";

export function useUploadTemplate() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadTemplateResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const upload = useCallback(async (file: File | Blob, description?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await TemplateService.upload(file, description);
      setResult(res);
      return res;
    } catch (err) {
      setError(err as Error);
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

  return { loading, result, error, upload, reset } as const;
}

export default useUploadTemplate;

// hooks/support-requests/useUploadSupportRequestImages.ts
"use client";

import { useCallback, useState } from "react";

import { SupportRequestService } from "@/services/support-request.services";
import type { UploadSupportRequestImagesResponse } from "@/types/support/support-request.response";

export function useUploadSupportRequestImages() {
  const [loading, setLoading] = useState(false);

  const uploadSupportRequestImages = useCallback(
    async (
      id: string,
      images: File[]
    ): Promise<UploadSupportRequestImagesResponse> => {
      setLoading(true);
      try {
        const res = await SupportRequestService.uploadSupportRequestImages(
          id,
          images
        );
        return res;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    uploadSupportRequestImages,
    loading,
  };
}

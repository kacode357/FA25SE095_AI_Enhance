// hooks/image-upload/useImageUpload.ts
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ImageUploadService } from "@/services/image-upload.services";
import type { ImageUploadResponse } from "@/types/image-upload/image-upload.response";

export function useImageUpload() {
  const [uploadingCount, setUploadingCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

  const uploadImage = async (
    file: File
  ): Promise<ImageUploadResponse | null> => {
    setUploadingCount((c) => c + 1);
    setLastError(null);
    try {
      const res = await ImageUploadService.uploadImage(file);
      return res;
    } catch (err: any) {
      const message =
        err?.message || "Upload image failed. Please try again.";
      setLastError(message);
      toast.error(message);
      return null;
    } finally {
      setUploadingCount((c) => Math.max(0, c - 1));
    }
  };

  return {
    uploadImage,
    uploading: uploadingCount > 0,
    uploadingCount,
    lastError,
  };
}


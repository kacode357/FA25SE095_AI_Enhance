// services/image-upload.services.ts
import { courseAxiosInstance as api } from "@/config/axios.config";
import type { ImageUploadResponse } from "@/types/image-upload/image-upload.response";

export const ImageUploadService = {
  uploadImage: async (file: File): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append("image", file, file.name);

    const res = await api.post<ImageUploadResponse>(
      "/v1/ImageUpload/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "text/plain",
        },
      }
    );

    return res.data;
  },
};


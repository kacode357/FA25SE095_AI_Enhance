// types/image-upload/image-upload.response.ts

export interface ImageUploadResponse {
  success: boolean;
  message: string;
  imageUrl: string;
  fileName: string;
  fileSizeBytes: number;
  contentType: string;
}


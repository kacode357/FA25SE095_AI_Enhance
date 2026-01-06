// types/template/template.response.ts
// Response types for Template endpoints
export interface TemplateItem {
  id: string;
  originalFileName?: string;
  name?: string;
  filename?: string;
  fileSize?: number;
  fileSizeFormatted?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  description?: string;
  type?: string;
  [key: string]: any;
}

// Response when backend returns an active template wrapper
export interface ActiveTemplateResponse {
  hasActiveTemplate: boolean;
  template: TemplateItem | null;
  message?: string;
}

// GetTemplateMetadata can return a single TemplateItem, an array, or the ActiveTemplateResponse wrapper
export type GetTemplateMetadataResponse = TemplateItem | TemplateItem[] | ActiveTemplateResponse;

// Backwards-compatible alias used across hooks/components
export type TemplateMetadata = TemplateItem;

// Response returned when uploading a template (matches TemplateItem but kept explicit)
export interface UploadTemplateResponse {
  id: string;
  originalFileName: string;
  fileSize: number;
  fileSizeFormatted?: string;
  uploadedBy: string;
  uploadedAt: string; // ISO
  updatedAt?: string; // ISO
  isActive: boolean;
  description?: string;
  [key: string]: any;
}

// Delete response
export interface DeleteTemplateResponse {
  success: boolean;
  message: string;
  templateId?: string;
}

export { };


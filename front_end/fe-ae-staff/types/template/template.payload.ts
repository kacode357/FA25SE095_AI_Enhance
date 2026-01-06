// types/template/template.payload.ts
// Request payload / params for Template endpoints

export interface GetTemplateMetadataQuery {
  isActive?: boolean;
}

export interface UploadTemplatePayload {
  file: File | Blob;
  description?: string;
}

export interface DeleteTemplateParams {
  id: string; // UUID
}

export { };


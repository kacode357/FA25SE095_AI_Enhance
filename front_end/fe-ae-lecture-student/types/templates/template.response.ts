export interface ReportTemplatePreviewResponse {
  htmlContent: string;
  templateName: string;
  version: string;
  lastModified: string; // ISO datetime string
  maxLength: number;
  description?: string | null;
}

export type { ReportTemplatePreviewResponse as ReportPreviewResponse };

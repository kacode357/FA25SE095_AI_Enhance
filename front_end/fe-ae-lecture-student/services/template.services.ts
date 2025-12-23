// services/template.services.ts
import { courseAxiosInstance as api } from "@/config/axios.config";
import type { ReportPreviewResponse } from "@/types/templates/template.response";

export const TemplateService = {
  /** GET /api/Template/report/preview — get report template HTML for preview */
  getReportPreview: async (): Promise<ReportPreviewResponse> => {
    const res = await api.get<ReportPreviewResponse>(
      "/Template/report/preview"
    );
    return res.data;
  },

  /** GET /api/Template/report/download — download report template as .docx */
  getReportDownload: async (): Promise<Blob> => {
    const res = await api.get(`/Template/report/download`, {
      responseType: "blob",
      headers: { Accept: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
    });
    return res.data;
  },
};

export default TemplateService;

// services/template.services.ts
import { courseAxiosInstance } from "@/config/axios.config";
import type { GetTemplateMetadataQuery } from "@/types/template/template.payload";
import type { GetTemplateMetadataResponse } from "@/types/template/template.response";

export const TemplateService = {
  /**
   * GET /Template/metadata
   * - if `isActive` is omitted, backend returns active template metadata only
   * - if provided (true/false), backend returns list filtered by active status
   */
  getMetadata: async (isActive?:  boolean): Promise<GetTemplateMetadataResponse> => {
    const params: GetTemplateMetadataQuery | undefined = isActive === undefined ? undefined : { isActive };
    const res = await courseAxiosInstance.get<GetTemplateMetadataResponse>("/Template/metadata", { params });
    return res.data;
  },

  /**
   * GET /Template/download
   * Downloads the active template file (for lecturers)
   * Returns file blob for download. Server should set `Content-Disposition` header with filename.
   */
  download: async (id?: string): Promise<{ blob: Blob; filename: string } | null> => {
    try {
      const res = await courseAxiosInstance.get<ArrayBuffer>("/Template/download", {
        responseType: "arraybuffer",
        params: id ? { id } : undefined,
      });

      const contentDisposition = res.headers?.["content-disposition"] || res.headers?.["Content-Disposition"] || "";
      let filename = "template.docx";
      const match = /filename\*?=([^;]+)/i.exec(contentDisposition);
      if (match) {
        filename = match[1].trim().replace(/"/g, "");
      }

      const blob = new Blob([res.data]);
      return { blob, filename };
    } catch (err) {
      return null;
    }
  },
};

export default TemplateService;

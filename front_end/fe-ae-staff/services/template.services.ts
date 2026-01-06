// services/template.services.ts
import { courseAxiosInstance } from "@/config/axios.config";
import type { GetTemplateMetadataQuery, UploadTemplatePayload } from "@/types/template/template.payload";
import type { DeleteTemplateResponse, GetTemplateMetadataResponse, UploadTemplateResponse } from "@/types/template/template.response";

export const TemplateService = {
  /**
   * GET /Template/metadata
   * - if `isActive` is omitted, backend returns active template metadata only
   * - if provided (true/false), backend returns list filtered by active status
   */
  getMetadata: async (isActive?: boolean): Promise<GetTemplateMetadataResponse> => {
    const params: GetTemplateMetadataQuery | undefined = isActive === undefined ? undefined : { isActive };
    const res = await courseAxiosInstance.get<GetTemplateMetadataResponse>("/Template/metadata", { params });
    return res.data;
  },

  /**
   * PATCH /Template/{id}/toggle-status
   * Toggles template active status (staff only)
   */
  toggleStatus: async (id: string): Promise<UploadTemplateResponse> => {
    const res = await courseAxiosInstance.patch<UploadTemplateResponse>(
      `/Template/${id}/toggle-status`
    );
    return res.data;
  },

  /**
   * POST /Template/upload
   * multipart/form-data: file (binary) + optional description
   * Staff only
   */
  upload: async (
    fileOrBlob: File | Blob,
    description?: string
  ): Promise<UploadTemplateResponse> => {
    const payload: UploadTemplatePayload = { file: fileOrBlob, description };
    const form = new FormData();
    form.append("file", payload.file);
    if (payload.description) form.append("description", payload.description);

    const res = await courseAxiosInstance.post<UploadTemplateResponse>("/Template/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  },

  /**
   * DELETE /Template/{id}
   * Deletes a template file (staff only)
   */
  delete: async (id: string): Promise<DeleteTemplateResponse> => {
    const res = await courseAxiosInstance.delete<DeleteTemplateResponse>(`/Template/${id}`);
    return res.data;
  },

  /**
   * GET /Template/{id}/download
   * Returns file blob for download. Server should set `Content-Disposition` header with filename.
   */
  download: async (id: string): Promise<{ blob: Blob; filename: string } | null> => {
    try {
      const res = await courseAxiosInstance.get<ArrayBuffer>(`/Template/download`, {
        params: { id },
        responseType: "arraybuffer",
      });

      const contentDisposition = res.headers?.["content-disposition"] || res.headers?.["Content-Disposition"] || "";
      let filename = "download";
      if (contentDisposition) {
        const fnStarMatch = /filename\*=([^;]+)/i.exec(contentDisposition);
        if (fnStarMatch && fnStarMatch[1]) {
          // filename*=UTF-8''TEMPLATE_REPORT.docx or percent-encoded
          let val = fnStarMatch[1].trim().replace(/"/g, "");
          val = val.replace(/^UTF-8''/i, '');
          try {
            filename = decodeURIComponent(val);
          } catch (e) {
            filename = val;
          }
        } else {
          const fnMatch = /filename=([^;]+)/i.exec(contentDisposition);
          if (fnMatch && fnMatch[1]) {
            filename = fnMatch[1].trim().replace(/"/g, "");
          }
        }
      }

      const contentType = (res.headers && (res.headers["content-type"] || res.headers["Content-Type"])) || 'application/octet-stream';
      const blob = new Blob([res.data], { type: contentType });
      return { blob, filename };
    } catch (err) {
      return null;
    }
  },
};

export default TemplateService;

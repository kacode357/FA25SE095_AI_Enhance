// services/enrollments-import.services.ts
import { courseAxiosInstance } from "@/config/axios.config";
import type { EnrollmentImportPayload } from "@/types/enrollments/enrollment-import.payload";
import type {
  EnrollmentImportResponse,
  EnrollmentTemplateFile,
} from "@/types/enrollments/enrollment-import.response";

/** Tiện ích: lấy filename từ Content-Disposition */
function parseFilenameFromContentDisposition(cd?: string | null): string | null {
  if (!cd) return null;

  // filename*=UTF-8''My%20File.xlsx  (RFC5987)
  const utf8Match = cd.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      // ignore and fallback
    }
  }

  // filename=MyFile.xlsx
  const simpleMatch = cd.match(/filename\s*=\s*("?)([^";]+)\1/i);
  if (simpleMatch?.[2]) return simpleMatch[2];

  return null;
}

export const EnrollmentsImportService = {
  /** ✅ GET /api/enrollments/import-template => tải file Excel template */
  downloadTemplate: async (): Promise<EnrollmentTemplateFile> => {
    const res = await courseAxiosInstance.get<ArrayBuffer>("/enrollments/import-template", {
      responseType: "arraybuffer", // blob cũng được; arraybuffer giúp đọc ổn định hơn
      // headers: { accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }, // optional
    });

    const contentType =
      (res.headers as any)["content-type"] ||
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    const cd = (res.headers as any)["content-disposition"] as string | undefined;
    const filename = parseFilenameFromContentDisposition(cd) || "StudentEnrollmentTemplate.xlsx";

    const blob = new Blob([res.data], { type: contentType });
    return { blob, filename };
  },

  /** ✅ POST /api/enrollments/import (multipart/form-data) */
  import: async (payload: EnrollmentImportPayload): Promise<EnrollmentImportResponse> => {
    const form = new FormData();
    form.append("file", payload.file);
    if (typeof payload.createAccountIfNotFound === "boolean") {
      form.append("createAccountIfNotFound", String(payload.createAccountIfNotFound));
    }

    const res = await courseAxiosInstance.post<EnrollmentImportResponse>(
      "/enrollments/import",
      form,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return res.data;
  },
};

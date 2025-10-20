// types/enrollments/enrollment-import.payload.ts

/** ✅ POST /api/enrollments/import (multipart/form-data) */
export interface EnrollmentImportPayload {
  file: File;
  /** Nếu true: tự tạo account cho email chưa tồn tại */
  createAccountIfNotFound?: boolean;
}

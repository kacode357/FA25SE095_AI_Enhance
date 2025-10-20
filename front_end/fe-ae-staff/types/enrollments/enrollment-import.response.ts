// types/enrollments/enrollment-import.response.ts

/** ✅ Kết quả import enrollments */
export interface EnrollmentImportResponse {
  success: boolean;
  message: string;
  totalRows: number;
  successfulEnrollments: number;
  failedEnrollments: number;
  studentsCreated: number;
  errors: string[];
  enrolledCourseIds: string[];
  createdStudentEmails: string[];
}

/** ✅ Kết quả tải template (service sẽ trả blob + filename) */
export interface EnrollmentTemplateFile {
  blob: Blob;
  /** tên file lấy từ Content-Disposition; fallback nếu không có */
  filename: string;
}

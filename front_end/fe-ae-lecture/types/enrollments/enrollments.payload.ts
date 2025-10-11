// types/enrollments/enrollments.payload.ts

/**
 * ✅ Generic import payload for multi-upload operations
 * Used for importing enrollments via Excel file
 */
export interface ImportEnrollmentsPayload {
  /** The Excel file (.xlsx or .xls) containing enrollment data */
  file: File;
}

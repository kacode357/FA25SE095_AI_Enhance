// types/term/term.payload.ts

/** Sort field cho /api/Terms */
export type TermSortBy = "Name" | "CreatedAt" | "UpdatedAt";

/** Sort direction cho /api/Terms */
export type TermSortDirection = "asc" | "desc";

/** Query payload cho GET /api/Terms */
export interface GetTermsDropdownPayload {
  /** Chỉ lấy term đang active */
  activeOnly?: boolean;
  /** Filter theo tên (partial, case-insensitive) */
  name?: string;

  /** Phân trang */
  page?: number;      // default 1
  pageSize?: number;  // default 10, max 100

  /** Sắp xếp */
  sortBy?: TermSortBy;              // "Name" | "CreatedAt" | "UpdatedAt"
  sortDirection?: TermSortDirection; // "asc" | "desc"
}

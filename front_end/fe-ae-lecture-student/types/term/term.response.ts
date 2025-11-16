// types/term/term.response.ts

/** Một term đầy đủ từ /api/Terms */
export interface TermResponse {
  id: string;
  name: string;
  description: string;
  startDate: string;    // ISO string: "0001-01-01T00:00:00" ...
  endDate: string;      // ISO string
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Response của GET /api/Terms */
export interface GetTermsDropdownResponse {
  success: boolean;
  message: string;
  terms: TermResponse[];

  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

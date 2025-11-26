export type TermSortBy = "Name" | "CreatedAt" | "UpdatedAt";

export type TermSortDirection = "asc" | "desc";

export interface GetTermsDropdownPayload {
  activeOnly?: boolean;
  name?: string;
  page?: number;
  pageSize?: number;
  sortBy?: TermSortBy;
  sortDirection?: TermSortDirection;
}

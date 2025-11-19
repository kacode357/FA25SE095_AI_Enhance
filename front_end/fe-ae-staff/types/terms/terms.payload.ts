// types/terms/terms.payload.ts

export interface CreateTermPayload {
  name: string;
  description: string;
  startDate: string; // ISO string
  endDate: string;   // ISO string
  isActive: boolean;
}

export interface UpdateTermPayload {
  name: string;
  description: string;
  startDate: string; // ISO string
  endDate: string;   // ISO string
  isActive: boolean;
}

export interface GetTermsQuery {
  activeOnly?: boolean;
  name?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
  sortBy?: "Name" | "CreatedAt" | "UpdatedAt";
  sortDirection?: "asc" | "desc";
}

export interface GetTermByIdPayload {
  termId: string;
}
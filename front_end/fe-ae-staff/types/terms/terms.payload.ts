// types/terms/terms.payload.ts

export interface CreateTermPayload {
  name: string;
  description: string;
  isActive: boolean;
}

export interface UpdateTermPayload {
  name: string;
  description: string;
  isActive: boolean;
}

export interface GetTermsQuery {
  activeOnly?: boolean;        
  name?: string;                 
  page?: number;
  pageSize?: number;         
  sortBy?: "Name" | "CreatedAt" | "UpdatedAt";
  sortDirection?: "asc" | "desc"; 
}

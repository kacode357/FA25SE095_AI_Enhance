// types/terms/terms.response.ts

export interface Term {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTermResponse {
  success: boolean;
  message: string;
  term: Term;
}

export interface GetTermsResponse {
  success: boolean;
  message: string;
  terms: Term[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GetTermByIdResponse {
  success: boolean;
  message: string;
  term: Term;
}

export interface UpdateTermResponse {
  success: boolean;
  message: string;
  term: Term;
}

export interface DeleteTermResponse {
  success: boolean;
  message: string;
}

export interface TermDropdown {
  id: string;
  name: string;
}

export interface GetTermDropdownResponse {
  success: boolean;
  message: string;
  terms: TermDropdown[];
}

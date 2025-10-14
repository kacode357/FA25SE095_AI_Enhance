export interface TermResponse {
  id: string;
  name: string;
}

export interface GetTermsDropdownResponse {
  success: boolean;
  message: string;
  terms: TermResponse[];
}

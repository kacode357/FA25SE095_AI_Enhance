export interface Topic {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  lastModifiedBy: string | null;
  lastModifiedAt: string | null;
}

export interface CreateTopicResponse {
  success: boolean;
  message: string;
  topic: Topic;
}

export interface UpdateTopicResponse {
  success: boolean;
  message: string;
  topic: Topic;
}

export interface GetTopicByIdResponse {
  success: boolean;
  message: string;
  topic: Topic;
}

export interface DeleteTopicResponse {
  success: boolean;
  message: string;
}

export interface GetTopicsQueryParams {
  name?: string;
  isActive?: boolean | null;
  page?: number;
  pageSize?: number;
  sortBy?: "name" | "createdAt";
  sortDirection?: "asc" | "desc";
}

export interface GetAllTopics {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  lastModifiedBy: string | null;
  lastModifiedAt: string | null;
}

export interface GetTopicsResponse {
  success: boolean;
  message: string;
  topics: GetAllTopics[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GetDropdownTopics {
  id: string;
  name: string;
}

export interface GetDropdownTopicsResponse {
  success: boolean;
  message: string;
  topics: GetDropdownTopics[];
}

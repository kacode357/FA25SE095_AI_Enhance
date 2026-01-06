export interface TopicWeight {
  id: string;
  topicId: string;
  topicName?: string | null;
  courseCodeId?: string | null;
  courseCodeName?: string | null;
  specificCourseId?: string | null;
  specificCourseName?: string | null;
  weightPercentage: number;
  description?: string | null;
  configuredBy?: string | null;
  configuredAt?: string | null;
  updatedAt?: string | null;
}

export type CreateTopicWeightResponse = TopicWeight;

export interface DeleteTopicWeightResponse {
  success: boolean;
  message?: string;
}

export interface AvailableTopicForCourse {
  id: string;
  name: string;
  description?: string | null;
  weight: number;
  isCustomWeight: boolean;
}

export interface GetTopicWeightsQueryParams {
  pageNumber?: number;
  pageSize?: number;
  courseCode?: string;
  topicName?: string;
  courseCodeId?: string;
  topicId?: string;
}

export interface GetTopicWeightsResponse {
  success: boolean;
  message?: string;
  data: TopicWeight[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}


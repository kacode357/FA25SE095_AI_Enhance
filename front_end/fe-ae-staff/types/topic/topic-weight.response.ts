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
  // Optional flags returned by the API to indicate edit/delete permissions and warnings
  canUpdate?: boolean;
  canDelete?: boolean;
  blockReason?: string | null;
  warning?: string | null;
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
  specificCourseId?: string;
  topicId?: string;
  // If true, filter to show only weights that can be edited (not in active terms)
  canEdit?: boolean;
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

export interface BulkUpdatedWeightItem extends TopicWeight {
  canUpdate?: boolean;
  canDelete?: boolean;
  blockReason?: string | null;
  warning?: string | null;
}

export interface BulkUpdateTopicWeightsResponse {
  success: boolean;
  message?: string;
  warning?: string;
  updatedWeights?: BulkUpdatedWeightItem[];
  errors?: string[];
  successCount?: number;
  failedCount?: number;
}

export interface TopicWeightHistoryResponse {
  id: string;
  topicWeightId: string;
  topicId: string;
  topicName?: string | null;
  courseCodeId?: string | null;
  courseCodeName?: string | null;
  specificCourseId?: string | null;
  specificCourseName?: string | null;
  termId?: string | null;
  termName?: string | null;
  oldWeightPercentage?: number | null;
  newWeightPercentage?: number | null;
  modifiedBy?: string | null;
  modifiedAt?: string | null;
  action?: string | null;
  changeReason?: string | null;
  affectedTerms?: string | null;
}

export interface BulkCreateTopicWeightsByCourseResponse {
  success: boolean;
  message?: string;
  createdWeights?: TopicWeight[];
  errors?: string[];
  warning?: string;
  successCount?: number;
  failedCount?: number;
}


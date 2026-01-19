export interface CreateTopicWeightPayload {
  topicId: string;
  courseCodeId: string;
  specificCourseId: string;
  weightPercentage: number;
  description?: string | null;
}

export interface UpdateTopicWeightPayload {
  id: string;
  topicId?: string;
  courseCodeId?: string | null;
  specificCourseId?: string | null;
  weightPercentage?: number;
  description?: string | null;
}

export interface DeleteTopicWeightPayload {
  id: string;
}

export interface BulkTopicWeightItem {
  topicId: string;
  weightPercentage: number;
  description?: string | null;
}

export type BulkTopicWeightPayload = BulkTopicWeightItem[];

export interface BulkCreateTopicWeightsByCoursePayload {
  courseId: string;
  weights: BulkTopicWeightItem[];
  configuredBy: string;
  changeReason?: string | null;
}

export interface UpdateTopicWeightBody {
  weightPercentage?: number;
  description?: string | null;
}

export interface BulkUpdateTopicWeightItem {
  id: string;
  weightPercentage: number;
  description?: string | null;
}

export interface BulkUpdateTopicWeightsPayload {
  courseCodeId: string;
  configuredBy: string;
  changeReason?: string | null;
  updates: BulkUpdateTopicWeightItem[];
}

export interface BulkUpdateTopicWeightsByCoursePayload {
  courseId: string;
  configuredBy: string;
  changeReason?: string | null;
  updates: BulkUpdateTopicWeightItem[];
}

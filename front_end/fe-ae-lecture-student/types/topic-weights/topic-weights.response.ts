// types/topic-weights/topic-weights.response.ts
// Response types for TopicWeights endpoints

export interface AvailableTopicWeight {
  id: string;
  name: string;
  description: string;
  weight: number;
  isCustomWeight: boolean;
}

export interface GetAvailableTopicWeightsResponse {
  success: boolean;
  message: string;
  topics: AvailableTopicWeight[];
}

export { };

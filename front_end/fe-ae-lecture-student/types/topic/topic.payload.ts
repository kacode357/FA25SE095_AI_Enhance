export interface CreateTopicPayload {
    name: string;
    description: string;
    isActive: boolean;
}

export interface UpdateTopicPayload {
    topicId: string;
}

export interface DeleteTopicPayload {
    topicId: string;
}

export interface GetTopicByIdPayload {
    topicId: string;
}
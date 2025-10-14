export interface CreateGroupPayload {
  courseId: string;
  name: string;
  description: string;
  maxMembers: number;
  isLocked: boolean;
}
export interface UpdateGroupPayload extends Partial<CreateGroupPayload> {
  groupId: string;
  courseId?: string;
}
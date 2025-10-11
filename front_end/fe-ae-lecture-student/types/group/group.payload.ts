export interface CreateGroupPayload {
  courseId: string;
  name: string;
  description: string;
  maxMembers: number;
  isLocked: boolean;
}
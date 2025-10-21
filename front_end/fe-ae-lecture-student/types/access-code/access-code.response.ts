export interface GetAccessCodeResponse {
  success: boolean;
  message: string;
  requiresAccessCode: boolean;
  accessCode: string;
  accessCodeCreatedAt: string | Date;
  accessCodeExpiresAt: string | Date | null;
  isExpired: boolean;
  failedAttempts: number;
}

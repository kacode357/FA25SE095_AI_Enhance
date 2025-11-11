// types/user/user.response.ts

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  subscriptionTier: string;
  isEmailConfirmed: boolean;
  emailConfirmedAt: string;
  lastLoginAt: string;
  crawlQuotaUsed: number;
  crawlQuotaLimit: number;
  quotaResetDate: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  institutionName?: string;
  institutionAddress?: string;
  profilePictureUrl: string;
  studentId?: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  updatedProfile: UserProfile;
}

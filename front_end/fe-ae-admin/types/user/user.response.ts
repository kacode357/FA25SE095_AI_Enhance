// types/user/user.response.ts

export enum UserStatus {
    Pending = 0,        // Account created but not verified
    Active = 1,         // Fully active account
    Inactive = 2,       // Temporarily disabled
    Suspended = 3,      // Suspended due to policy violation
    Deleted = 4,        // Soft deleted
    PendingApproval = 5 // Waiting for staff approval (lecturers)
}
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: UserStatus;
  subscriptionTier: string;
  fullName: string;
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

export interface UploadAvatarData {
  userId: string;
  profilePictureUrl: string;
}
export interface UploadAvatarResponse {
  status: number;
  message: string;
  data: UploadAvatarData;
}
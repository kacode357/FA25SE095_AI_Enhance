// types/user/user.payload.ts

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  institutionName: string;
  institutionAddress: string;
  department: string;
  studentId?: string;
}

export interface UploadAvatarPayload {
  file: File;
}

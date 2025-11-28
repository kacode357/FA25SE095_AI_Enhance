// types/announcements/announcement.response.ts

export enum AnnouncementAudience {
  All = 0,
  Students = 1,
  Lecturers = 2,
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content?: string;
  audience: AnnouncementAudience;
  publishedAt: string;

  createdBy?: string;
  createdByName?: string;
  creatorProfilePictureUrl?: string | null;
}

export interface PaginatedAnnouncements {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: AnnouncementItem[];
}

export interface CreateAnnouncementResponse {
  status: number; // 201
  message: string; // "Announcement created successfully"
  data: {
    id: string;
    title: string;
    audience: AnnouncementAudience;
    publishedAt: string;
  };
}

export interface GetAnnouncementsResponse {
  status: number;  // 200
  message: string; // "Announcements retrieved"
  data: PaginatedAnnouncements;
}

export interface GetAnnouncementByIdResponse {
  status: number;  // 200
  message: string; // "Announcement fetched successfully"
  data: AnnouncementItem;
}

export interface UpdateAnnouncementResponse {
  status: number;  // 200
  message: string; // "Announcement updated successfully"
  data: {
    id: string;
    title: string;
    audience: AnnouncementAudience;
    publishedAt: string;
  };
}

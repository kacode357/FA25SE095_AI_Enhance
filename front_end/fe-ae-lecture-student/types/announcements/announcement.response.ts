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
  status: number;
  message: string;
  data: {
    id: string;
    title: string;
    audience: AnnouncementAudience;
    publishedAt: string;
  };
}

export interface GetAnnouncementsResponse {
  status: number;
  message: string;
  data: PaginatedAnnouncements;
}

export interface GetAnnouncementByIdResponse {
  status: number;
  message: string;
  data: AnnouncementItem;
}

export interface UpdateAnnouncementResponse {
  status: number;
  message: string;
  data: {
    id: string;
    title: string;
    audience: AnnouncementAudience;
    publishedAt: string;
  };
}

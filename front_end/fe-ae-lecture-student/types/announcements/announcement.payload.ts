import { AnnouncementAudience } from "./announcement.response";

export interface CreateAnnouncementPayload {
  title: string;
  content: string;
  audience: AnnouncementAudience;
  publishedAt: string;
}

export interface UpdateAnnouncementPayload {
  title: string;
  content: string;
  audience: AnnouncementAudience;
  publishedAt: string;
}

export interface GetAnnouncementsQuery {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  audience?: AnnouncementAudience;
}

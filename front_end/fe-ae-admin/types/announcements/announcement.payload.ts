import { AnnouncementAudience } from "./announcement.response";

interface AnnouncementPayloadBase {
  title: string;
  content: string;
  audience: AnnouncementAudience;
  publishedAt: string;
}

export type CreateAnnouncementPayload = AnnouncementPayloadBase;
export type UpdateAnnouncementPayload = AnnouncementPayloadBase;

export interface GetAnnouncementsQuery {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  audience?: AnnouncementAudience;
}

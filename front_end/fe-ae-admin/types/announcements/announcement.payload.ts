// types/announcements/announcement.payload.ts

import { AnnouncementAudience } from "./announcement.response";

export interface CreateAnnouncementPayload {
  title: string;
  content: string;
  audience: AnnouncementAudience;
  /**
   * ISO string: "2025-11-28T02:06:21.000Z"
   */
  publishedAt: string;
}

export interface UpdateAnnouncementPayload {
  title: string;
  content: string;
  audience: AnnouncementAudience;
  /**
   * ISO string: "2025-11-28T02:06:21.000Z"
   */
  publishedAt: string;
}

export interface GetAnnouncementsQuery {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
   audience?: AnnouncementAudience;
}

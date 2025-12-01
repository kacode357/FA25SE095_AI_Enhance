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

interface ResponseEnvelope<T> {
  status: number;
  message: string;
  data: T;
}

type AnnouncementMutationData = Pick<
  AnnouncementItem,
  "id" | "title" | "audience" | "publishedAt"
>;

export type CreateAnnouncementResponse =
  ResponseEnvelope<AnnouncementMutationData>;
export type UpdateAnnouncementResponse =
  ResponseEnvelope<AnnouncementMutationData>;
export type GetAnnouncementsResponse =
  ResponseEnvelope<PaginatedAnnouncements>;
export type GetAnnouncementByIdResponse = ResponseEnvelope<AnnouncementItem>;

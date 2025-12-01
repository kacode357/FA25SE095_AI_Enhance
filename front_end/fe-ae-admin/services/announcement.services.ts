import { userAxiosInstance } from "@/config/axios.config";

import type {
  CreateAnnouncementPayload,
  GetAnnouncementsQuery,
  UpdateAnnouncementPayload,
} from "@/types/announcements/announcement.payload";
import type {
  CreateAnnouncementResponse,
  GetAnnouncementsResponse,
  GetAnnouncementByIdResponse,
  UpdateAnnouncementResponse,
} from "@/types/announcements/announcement.response";

const buildAnnouncementQuery = (params?: GetAnnouncementsQuery) => {
  const query: Record<string, unknown> = {
    Page: params?.page,
    PageSize: params?.pageSize,
    SearchTerm: params?.searchTerm,
  };

  if (typeof params?.audience === "number") {
    query.Audience = params.audience;
  }

  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined)
  );
};

const fetchAnnouncements = async (
  url: string,
  params?: GetAnnouncementsQuery
) => {
  const res = await userAxiosInstance.get<GetAnnouncementsResponse>(url, {
    params: buildAnnouncementQuery(params),
  });
  return res.data;
};

export const AnnouncementService = {
  createAnnouncement: async (
    payload: CreateAnnouncementPayload
  ): Promise<CreateAnnouncementResponse> => {
    const res = await userAxiosInstance.post<CreateAnnouncementResponse>(
      "/Announcements",
      payload
    );
    return res.data;
  },

  getAnnouncementById: async (
    id: string
  ): Promise<GetAnnouncementByIdResponse> => {
    const res = await userAxiosInstance.get<GetAnnouncementByIdResponse>(
      `/Announcements/${id}`
    );
    return res.data;
  },

  updateAnnouncement: async (
    id: string,
    payload: UpdateAnnouncementPayload
  ): Promise<UpdateAnnouncementResponse> => {
    const res = await userAxiosInstance.put<UpdateAnnouncementResponse>(
      `/Announcements/${id}`,
      payload
    );
    return res.data;
  },

  getStudentAnnouncements: async (
    params?: GetAnnouncementsQuery
  ): Promise<GetAnnouncementsResponse> =>
    fetchAnnouncements("/Announcements/students", params),

  getLecturerAnnouncements: async (
    params?: GetAnnouncementsQuery
  ): Promise<GetAnnouncementsResponse> =>
    fetchAnnouncements("/Announcements/lecturers", params),

  getAdminAnnouncements: async (
    params?: GetAnnouncementsQuery
  ): Promise<GetAnnouncementsResponse> =>
    fetchAnnouncements("/Announcements/admin", params),
};

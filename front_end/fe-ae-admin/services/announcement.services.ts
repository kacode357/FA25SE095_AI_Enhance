// services/announcement.services.ts
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
  ): Promise<GetAnnouncementsResponse> => {
    const query: Record<string, unknown> = {
      Page: params?.page,
      PageSize: params?.pageSize,
      SearchTerm: params?.searchTerm,
    };

    // ✅ chỉ truyền Audience khi có set cụ thể (0 | 1 | 2)
    if (typeof params?.audience === "number") {
      query.Audience = params.audience;
    }

    const res = await userAxiosInstance.get<GetAnnouncementsResponse>(
      "/Announcements/students",
      { params: query }
    );
    return res.data;
  },

  getLecturerAnnouncements: async (
    params?: GetAnnouncementsQuery
  ): Promise<GetAnnouncementsResponse> => {
    const query: Record<string, unknown> = {
      Page: params?.page,
      PageSize: params?.pageSize,
      SearchTerm: params?.searchTerm,
    };

    if (typeof params?.audience === "number") {
      query.Audience = params.audience;
    }

    const res = await userAxiosInstance.get<GetAnnouncementsResponse>(
      "/Announcements/lecturers",
      { params: query }
    );
    return res.data;
  },

  getAdminAnnouncements: async (
    params?: GetAnnouncementsQuery
  ): Promise<GetAnnouncementsResponse> => {
    const query: Record<string, unknown> = {
      Page: params?.page,
      PageSize: params?.pageSize,
      SearchTerm: params?.searchTerm,
    };

    // ✅ nếu không set audience ⇒ không truyền field ⇒ API trả cả 3 status
    // ✅ nếu set 0 | 1 | 2 ⇒ query.Audience = 0/1/2 ⇒ API lọc tương ứng
    if (typeof params?.audience === "number") {
      query.Audience = params.audience;
    }

    const res = await userAxiosInstance.get<GetAnnouncementsResponse>(
      "/Announcements/admin",
      { params: query }
    );
    return res.data;
  },
};

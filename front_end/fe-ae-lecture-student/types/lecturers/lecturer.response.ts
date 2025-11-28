// types/lecturers/lecturer.response.ts

export interface BaseLecturerApiResponse<T = unknown> {
  status: number;
  message: string;
  data: T;
}

export interface LecturerItem {
  id: string;
  fullName: string;
  profilePictureUrl: string | null;
  institutionName: string | null;
}

export interface LecturerListPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: LecturerItem[];
}

// response chính của GET /api/Lecturers
export type GetLecturersResponse = BaseLecturerApiResponse<LecturerListPagination>;

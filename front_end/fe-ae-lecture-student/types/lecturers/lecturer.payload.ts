// types/lecturers/lecturer.payload.ts

export interface GetLecturersQuery {
  /** Từ khóa tìm kiếm theo tên giảng viên */
  searchTerm?: string;
  /** Trang hiện tại (mặc định backend đang để page = 1 nếu không truyền) */
  page?: number;
  /** Số item mỗi trang */
  pageSize?: number;
}

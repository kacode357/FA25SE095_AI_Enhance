export interface CreateCourseCodePayload {
  code: string;
  title: string;
  description: string;
  department: string;
  isActive: boolean;
}

export interface UpdateCourseCodePayload {
  id: string;
  code: string;
  title: string;
  description: string;
  department: string;
  isActive: boolean;
}

export interface GetCourseCodesQuery {
  code?: string;
  title?: string;
  department?: string;
  isActive?: boolean;
  createdAfter?: string;
  createdBefore?: string;
  hasActiveCourses?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?:
    | "Code"
    | "Title"
    | "Department"
    | "CreatedAt"
    | "ActiveCoursesCount";
  sortDirection?: "asc" | "desc";
}

export interface GetCourseCodeOptionsQuery {
  activeOnly?: boolean;
  department?: string;
}

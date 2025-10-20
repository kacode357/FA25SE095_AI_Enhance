// services/group.services.ts
import { courseAxiosInstance } from "@/config/axios.config";
import type { GetGroupsByCourseResponse } from "@/types/groups/group.response";

export const GroupService = {
  /** ✅ GET /api/groups/courses/{courseId} */
  getByCourse: async (courseId: string): Promise<GetGroupsByCourseResponse> => {
    const res = await courseAxiosInstance.get<GetGroupsByCourseResponse>(
      `/groups/courses/${courseId}`
    );
    return res.data;
  },
};

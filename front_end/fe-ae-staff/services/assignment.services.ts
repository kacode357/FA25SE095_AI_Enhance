// services/assignment.services.ts
import { courseAxiosInstance } from "@/config/axios.config";
import type { GetAssignmentsQuery } from "@/types/assignments/assignment.payload";
import type {
  GetAssignmentsResponse,
  GetAssignmentByIdResponse,
} from "@/types/assignments/assignment.response";

export const AssignmentService = {
  /** ✅ GET /api/Assignments */
  getAll: async (params: GetAssignmentsQuery): Promise<GetAssignmentsResponse> => {
    const res = await courseAxiosInstance.get<GetAssignmentsResponse>("/Assignments", { params });
    return res.data;
  },

  /** ✅ GET /api/Assignments/{id} */
  getById: async (id: string): Promise<GetAssignmentByIdResponse> => {
    const res = await courseAxiosInstance.get<GetAssignmentByIdResponse>(`/Assignments/${id}`);
    return res.data;
  },
};

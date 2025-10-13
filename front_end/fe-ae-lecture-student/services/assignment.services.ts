import { courseAxiosInstance } from "@/config/axios.config";
import { CreateAssignmentPayload } from "@/types/assignment/assignment.payload";
import { CreateAssignmentResponse, GetAssignmentsByCourseIdResponse } from "@/types/assignment/assignment.response";

export const AssignmentService = {
  // POST /api/assignments
  create: async (data: CreateAssignmentPayload): Promise<CreateAssignmentResponse> => {
    const response = await courseAxiosInstance.post<CreateAssignmentResponse>("/Assignments", data);
    return response.data;
  },
  getByCourseId: async (courseId: string): Promise<GetAssignmentsByCourseIdResponse> => {
    const response = await courseAxiosInstance.get<GetAssignmentsByCourseIdResponse>(`/assignments/courses/${courseId}`);
    return response.data;
  },
};

// services/assignment.services.ts
import { courseAxiosInstance } from "@/config/axios.config";
import {
    AssignGroupsPayload,
    CreateAssignmentPayload,
    ExtendDueDatePayload,
    GetAssignmentsQuery,
    MyAssignmentsQuery,
    ScheduleAssignmentRequest,
    UnassignGroupsPayload,
    UpdateAssignmentPayload,
} from "@/types/assignments/assignment.payload";
import type { UploadAssignmentAttachmentsResponse } from "@/types/assignments/assignment.response";
import {
    AssignGroupsResponse,
    CloseAssignmentResponse,
    CreateAssignmentResponse,
    DeleteAssignmentResponse,
    ExtendDueDateResponse,
    GetAssignmentByIdResponse,
    GetAssignmentGroupsResponse,
    GetAssignmentsResponse,
    GetCourseAssignmentStatsResponse,
    GetGroupAssignmentLookupResponse,
    GetMyAssignmentsResponse,
    GetStudentCourseGradesResponse,
    GetUnassignedGroupsResponse,
    ScheduleAssignmentResponse,
    UnassignGroupsResponse,
    UpdateAssignmentResponse,
} from "@/types/assignments/assignment.response";

export const AssignmentService = {
  /** GET /api/Assignments/{id} */
  getById: async (id: string): Promise<GetAssignmentByIdResponse> => {
    const res = await courseAxiosInstance.get<GetAssignmentByIdResponse>(`/Assignments/${id}`);
    return res.data;
  },

  /** PUT /api/Assignments/{id} */
  update: async (id: string, payload: UpdateAssignmentPayload): Promise<UpdateAssignmentResponse> => {
    const res = await courseAxiosInstance.put<UpdateAssignmentResponse>(`/Assignments/${id}`, payload);
    return res.data;
  },

  /** DELETE /api/Assignments/{id} */
  remove: async (id: string): Promise<DeleteAssignmentResponse> => {
    const res = await courseAxiosInstance.delete<DeleteAssignmentResponse>(`/Assignments/${id}`);
    return res.data;
  },

  /** GET /api/Assignments */
  list: async (params: GetAssignmentsQuery): Promise<GetAssignmentsResponse> => {
    const res = await courseAxiosInstance.get<GetAssignmentsResponse>("/Assignments", { params });
    return res.data;
  },

  /** POST /api/Assignments */
  create: async (payload: CreateAssignmentPayload): Promise<CreateAssignmentResponse> => {
    const res = await courseAxiosInstance.post<CreateAssignmentResponse>("/Assignments", payload);
    return res.data;
  },

  /** GET /api/Assignments/my-assignments */
  myAssignments: async (params: MyAssignmentsQuery): Promise<GetMyAssignmentsResponse> => {
    const res = await courseAxiosInstance.get<GetMyAssignmentsResponse>("/Assignments/my-assignments", { params });
    return res.data;
  },

  /** GET /api/Assignments/courses/{courseId}/statistics */
  statsByCourse: async (courseId: string): Promise<GetCourseAssignmentStatsResponse> => {
    const res = await courseAxiosInstance.get<GetCourseAssignmentStatsResponse>(
      `/Assignments/courses/${courseId}/statistics`
    );
    return res.data;
  },

  /** GET /api/Assignments/courses/{courseId}/students/grades */
  getStudentGradesByCourse: async (courseId: string): Promise<GetStudentCourseGradesResponse> => {
    const res = await courseAxiosInstance.get<GetStudentCourseGradesResponse>(
      `/Assignments/courses/${courseId}/students/grades`
    );
    return res.data;
  },

  /** PATCH /api/Assignments/{id}/extend-due-date */
  extendDueDate: async (id: string, payload: ExtendDueDatePayload): Promise<ExtendDueDateResponse> => {
    const res = await courseAxiosInstance.patch<ExtendDueDateResponse>(`/Assignments/${id}/extend-due-date`, payload);
    return res.data;
  },

  /** PATCH /api/Assignments/{id}/close */
  close: async (id: string): Promise<CloseAssignmentResponse> => {
    const res = await courseAxiosInstance.patch<CloseAssignmentResponse>(`/Assignments/${id}/close`, {});
    return res.data;
  },

  /** POST /api/Assignments/assign-groups */
  assignGroups: async (payload: AssignGroupsPayload): Promise<AssignGroupsResponse> => {
    const res = await courseAxiosInstance.post<AssignGroupsResponse>("/Assignments/assign-groups", payload);
    return res.data;
  },

  /** POST /api/Assignments/unassign-groups */
  unassignGroups: async (payload: UnassignGroupsPayload): Promise<UnassignGroupsResponse> => {
    const res = await courseAxiosInstance.post<UnassignGroupsResponse>("/Assignments/unassign-groups", payload);
    return res.data;
  },

  /** GET /api/Assignments/{id}/groups */
  getGroups: async (id: string): Promise<GetAssignmentGroupsResponse> => {
    const res = await courseAxiosInstance.get<GetAssignmentGroupsResponse>(`/Assignments/${id}/groups`);
    return res.data;
  },

  /** GET /api/Assignments/courses/{courseId}/unassigned-groups */
  getUnassignedGroupsInCourse: async (courseId: string): Promise<GetUnassignedGroupsResponse> => {
    const res = await courseAxiosInstance.get<GetUnassignedGroupsResponse>(
      `/Assignments/courses/${courseId}/unassigned-groups`
    );
    return res.data;
  },

  /** GET /api/Assignments/groups/{groupId}/assignment */
  getAssignmentByGroupId: async (groupId: string): Promise<GetGroupAssignmentLookupResponse> => {
    const res = await courseAxiosInstance.get<GetGroupAssignmentLookupResponse>(
      `/Assignments/groups/${groupId}/assignment`
    );
    return res.data;
  },

  /** POST /api/Assignments/{id}/schedule */
  scheduleAssignment: async (
    id: string,
    payload: ScheduleAssignmentRequest
  ): Promise<ScheduleAssignmentResponse> => {
    const res = await courseAxiosInstance.post<ScheduleAssignmentResponse>(`/Assignments/${id}/schedule`, payload);
    return res.data;
  },

  /** POST /api/Assignments/{id}/attachments */
  uploadAttachments: async (
    id: string,
    files: File[] | FileList
  ): Promise<UploadAssignmentAttachmentsResponse> => {
    const form = new FormData();
    for (const f of Array.from(files)) {
      form.append("files", f as File);
    }

    const res = await courseAxiosInstance.post<UploadAssignmentAttachmentsResponse>(`/Assignments/${id}/attachments`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};

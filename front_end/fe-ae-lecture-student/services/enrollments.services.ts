import { courseAxiosInstance } from "@/config/axios.config";
import {
  ImportEnrollmentsPayload,
  ImportStudentsSpecificCoursePayload,
  JoinCoursePayload,
  UnenrollStudentParams,
  UnenrollStudentPayload,
} from "@/types/enrollments/enrollments.payload";
import {
  GetCourseEnrolledStudentsResponse,
  GetEnrollmentStudentResponse,
  GetMyEnrolledCoursesResponse,
  ImportEnrollmentsResponse,
  ImportStudentsSpecificCourseResponse,
  ImportStudentsTemplateResponse,
  ImportTemplateResponse,
  JoinCourseResponse,
  LeaveCourseResponse,
  UnenrollStudentResponse,
} from "@/types/enrollments/enrollments.response";

export const EnrollmentsService = {
  /** 📥 Import enrollments from Excel file */
  importEnrollments: async (
    data: ImportEnrollmentsPayload
  ): Promise<ImportEnrollmentsResponse> => {
    const formData = new FormData();

    //  Đính file
    formData.append("file", data.file);
    formData.append("ExcelFile", data.file);

    if (data.courseIds && data.courseIds.length > 0) {
      data.courseIds.forEach((id) => {
        formData.append("courseIds", id);
        formData.append("CourseIds", id);
      });
      formData.append("courseIdsJson", JSON.stringify(data.courseIds));
      formData.append("CourseIdsJson", JSON.stringify(data.courseIds));
    }

    formData.append(
      "createAccountIfNotFound",
      String(data.createAccountIfNotFound)
    );

    const response = await courseAxiosInstance.post<ImportEnrollmentsResponse>(
      "/enrollments/import",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return response.data;
  },

  /** 📄 Download global import template */
  downloadImportTemplate: async (): Promise<ImportTemplateResponse> => {
    const response = await courseAxiosInstance.get<Blob>(
      "/enrollments/import-template",
      {
        responseType: "blob",
        headers: {
          Accept:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      }
    );

    const contentDisposition = response.headers["content-disposition"];
    const fileName =
      contentDisposition?.split("filename=")[1]?.replace(/['"]/g, "") ||
      "StudentEnrollmentTemplate.xlsx";

    return {
      success: true,
      file: response.data,
      fileName,
      contentType: response.headers["content-type"],
    };
  },

  /** 📄 Download import template for a specific course */
  downloadImportStudentsTemplate:
    async (): Promise<ImportStudentsTemplateResponse> => {
      const response = await courseAxiosInstance.get<Blob>(
        "/enrollments/courses/import-students-template",
        {
          responseType: "blob",
          headers: {
            Accept:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
        }
      );

      const contentDisposition = response.headers["content-disposition"];
      const fileName =
        contentDisposition?.split("filename=")[1]?.replace(/['"]/g, "") ||
        "CourseStudentsTemplate.xlsx";

      return {
        success: true,
        file: response.data,
        fileName,
        contentType: response.headers["content-type"],
      };
    },

  /** 📤 Import students for a specific course */
  importStudentsSpecificCourse: async (
    data: ImportStudentsSpecificCoursePayload
  ): Promise<ImportStudentsSpecificCourseResponse> => {
    const formData = new FormData();
    formData.append("file", data.file);
    formData.append(
      "createAccountIfNotFound",
      String(data.createAccountIfNotFound)
    );

    const response =
      await courseAxiosInstance.post<ImportStudentsSpecificCourseResponse>(
        `/enrollments/courses/${data.courseId}/import-students`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

    return response.data;
  },

  /** 🧑‍🎓 Join a course (self-enroll) */
  joinCourse: async (
    courseId: string,
    data?: JoinCoursePayload
  ): Promise<JoinCourseResponse> => {
    const response = await courseAxiosInstance.post<JoinCourseResponse>(
      `/enrollments/courses/${courseId}/join`,
      data ?? {}
    );
    return response.data;
  },

  /** 🚪 Leave a course (self-unenroll) */
  leaveCourse: async (courseId: string): Promise<LeaveCourseResponse> => {
    const response = await courseAxiosInstance.post<LeaveCourseResponse>(
      `/enrollments/courses/${courseId}/leave`
    );
    return response.data;
  },

  /** 📚 Get my enrolled courses */
  getMyCourses: async (): Promise<GetMyEnrolledCoursesResponse> => {
    const res = await courseAxiosInstance.get<GetMyEnrolledCoursesResponse>(
      "/enrollments/my-courses"
    );
    return res.data;
  },

  /** 👥 Get all enrolled students in a course */
  getCourseStudents: async (
    courseId: string
  ): Promise<GetCourseEnrolledStudentsResponse> => {
    const res =
      await courseAxiosInstance.get<GetCourseEnrolledStudentsResponse>(
        `/enrollments/courses/${courseId}/students`
      );
    return res.data;
  },

  unenrollStudent: async (
    params: UnenrollStudentParams,
    body: UnenrollStudentPayload
  ): Promise<UnenrollStudentResponse> => {
    const { courseId, studentId } = params;

    const res = await courseAxiosInstance.delete<UnenrollStudentResponse>(
      `/enrollments/courses/${courseId}/students/${studentId}`,
      { data: body }
    );

    return res.data;
  },

  /** 👤 Get a specific enrolled student's details */
  getCourseStudent: async (
    courseId: string,
    studentId: string
  ): Promise<GetEnrollmentStudentResponse> => {
    const res = await courseAxiosInstance.get<GetEnrollmentStudentResponse>(
      `/enrollments/courses/${courseId}/students/${studentId}`
    );
    return res.data;
  },

};

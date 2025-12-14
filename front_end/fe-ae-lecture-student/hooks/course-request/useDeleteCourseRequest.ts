import { CourseRequestService } from "@/services/course-requests.services";
import { DeleteCourseRequestResponse } from "@/types/course-requests/course-request.response";
import { useState } from "react";

export const useDeleteCourseRequest = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const deleteCourseRequest = async (id: string): Promise<DeleteCourseRequestResponse> => {
        setLoading(true);
        setError(null);
        try {
            const res = await CourseRequestService.delete(id);
            return res;
        } catch (err) {
            const e = err as Error;
            setError(e);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    return {
        deleteCourseRequest,
        loading,
        error,
    } as const;
};

export default useDeleteCourseRequest;

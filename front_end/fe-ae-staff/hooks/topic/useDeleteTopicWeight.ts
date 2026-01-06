import { TopicWeightsService } from "@/services/topic-weights.services";
import { AxiosResponse } from "axios";
import { useState } from "react";
import { toast } from "sonner";

export function useDeleteTopicWeight() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteTopicWeight = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const resp: AxiosResponse<any> = await TopicWeightsService.delete(id);

      // If HTTP status indicates error, axios interceptor already showed toast.
      if (resp.status >= 400) {
        return false;
      }

      const res = resp.data as { success?: boolean; message?: string } | null;

      if (res?.success === false) {
        const msg = res.message || "Delete topic weight failed";
        setError(msg);
        toast.error(msg);
        return false;
      }

      toast.success(res?.message || "Delete topic weight successfully");
      return true;
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Delete topic weight failed";

      setError(msg);
      // axios interceptor already shows toast for HTTP errors (status >= 400),
      // so avoid duplicating the error toast here.
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, deleteTopicWeight };
}

import { TopicService } from "@/services/topic.services";
import { UpdateTopicPayload } from "@/types/topic/topic.payload";
import { useState } from "react";
import { toast } from "sonner";


export function useUpdateTopic() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTopic = async (topicId: string, payload: UpdateTopicPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await TopicService.update(topicId, payload);
      if (res?.success) {
        toast.success(res.message);
      } else {
        toast.error(res?.message || "Failed to update topic");
      }
      return res;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to update topic";
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, updateTopic };
}

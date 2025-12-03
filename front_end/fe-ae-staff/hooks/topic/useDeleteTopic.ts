import { TopicService } from "@/services/topic.services";
import { useState } from "react";
import { toast } from "sonner";

export function useDeleteTopic() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteTopic = async (topicId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await TopicService.delete(topicId);
      if (res?.success) {
        toast.success(res.message);
      } else {
        toast.error(res?.message || "Failed to delete topic");
      }
      return res;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to delete topic";
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, deleteTopic };
}
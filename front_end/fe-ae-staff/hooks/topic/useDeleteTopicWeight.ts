import { TopicWeightsService } from "@/services/topic-weights.services";
import { useState } from "react";
import { toast } from "sonner";

export function useDeleteTopicWeight() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteTopicWeight = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // Service resolves with no content for 204 — success if no exception thrown
      await TopicWeightsService.delete(id);
      toast.success("Deleted 1 config Topic Weight successfully");
      return true;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to delete topic weight";
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, deleteTopicWeight };
}

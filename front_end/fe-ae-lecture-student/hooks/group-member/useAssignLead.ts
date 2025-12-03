import { GroupMembersService } from "@/services/group-member.services";
import { AssignLeadPayload } from "@/types/group-members/group-member.payload";
import { AssignLeaderResponse } from "@/types/group-members/group-member.response";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function useAssignLead() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignLead = useCallback(
    async (
      payload: AssignLeadPayload,
      options?: { silent?: boolean }
    ): Promise<AssignLeaderResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        const res = await GroupMembersService.assignLeader(payload);
        if (!options?.silent) {
          toast.success(res.message || "Leader assigned successfully");
        }
        return res;
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to assign leader"
        );
        if (!options?.silent) {
          toast.error(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to assign leader"
          );
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { assignLead, loading, error };
}

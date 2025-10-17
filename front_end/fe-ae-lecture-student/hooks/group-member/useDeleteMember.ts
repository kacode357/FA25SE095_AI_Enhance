import { GroupMembersService } from "@/services/group-member.services";
import { DeleteMemberPayload } from "@/types/group-members/group-member.payload";
import { DeleteMemberResponse } from "@/types/group-members/group-member.response";
import { useCallback, useState } from "react";

export function useDeleteMember() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteMember = useCallback(
    async (
      payload: DeleteMemberPayload
    ): Promise<DeleteMemberResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await GroupMembersService.deleteGroupMember(payload);
        setLoading(false);
        return response;
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to delete member"
        );
        setLoading(false);
        return null;
      }
    },
    []
  );

  return { deleteMember, loading, error };
}

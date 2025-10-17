import { GroupMembersService } from "@/services/group-member.services";
import { AddGroupMembersPayload } from "@/types/group-members/group-member.payload";
import { AddGroupMembersResponse } from "@/types/group-members/group-member.response";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function useAddGroupMembers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addGroupMembers = useCallback(
    async (
      data: AddGroupMembersPayload,
      onCompleted?: (res: AddGroupMembersResponse) => void
    ): Promise<AddGroupMembersResponse | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = await GroupMembersService.addGroupMembers(data);
        if (res.success) {
          toast.success(`Added ${res.successCount} members successfully`);
        } else {
          toast.error(res.message || "Failed to add members");
        }
        onCompleted?.(res);
        return res;
      } catch (e: any) {
        const message = e?.message || "Failed to add members";
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { addGroupMembers, loading, error };
}

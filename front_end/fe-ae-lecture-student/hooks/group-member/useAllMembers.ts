"use client";

import { GroupMembersService } from "@/services/group-member.services";
import { GroupMember } from "@/types/group-members/group-member.response";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function useAllMembers() {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllMembers = useCallback(async (groupId: string) => {
    if (!groupId) {
      setError("Missing groupId");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await GroupMembersService.getAllMembers(groupId);
      if (res.success) {
        setMembers(res.members);
      } else {
        toast.error(res.message || "Failed to load members");
      }
    } catch (err: any) {
      const msg = err?.message || "Error fetching members";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    members,
    loading,
    error,
    fetchAllMembers,
  };
}

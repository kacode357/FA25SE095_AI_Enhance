"use client";

import { GroupMembersService } from "@/services/group-member.services";
import { AddGroupMemberPayload } from "@/types/group-members/group-member.payload";
import { GroupMembersResponse } from "@/types/group-members/group-member.response";
import { useState } from "react";
import { toast } from "sonner";

export function useAddGroupMember() {
  const [loading, setLoading] = useState(false);

  const addGroupMember = async (
    payload: AddGroupMemberPayload,
    showToast = true
  ): Promise<GroupMembersResponse | null> => {
    if (loading) return null;
    setLoading(true);

    try {
      const res = await GroupMembersService.addGroupMember(payload);
      const member = (res as any)?.member as GroupMembersResponse;
      if (showToast) toast.success("Member added successfully");
      return member;
    } catch (err: any) {
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { addGroupMember, loading };
}

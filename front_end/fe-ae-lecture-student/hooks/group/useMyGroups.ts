import { useCallback, useState } from "react";
import { GroupService } from "@/services/group.services";
import { GetMyGroupsResponse, MyGroupItem } from "@/types/group/group.response";

export function useMyGroups() {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<MyGroupItem[]>([]);
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState<string>("");

  const fetchMyGroups = useCallback(async (courseId?: string) => {
    setLoading(true);
    try {
      const res: GetMyGroupsResponse = await GroupService.getMyGroups(courseId);
      setGroups(res.groups ?? []);
      setTotal(res.totalGroups ?? res.groups?.length ?? 0);
      setMessage(res.message ?? "");
      return res;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    groups,
    total,
    message,
    fetchMyGroups,
  };
}

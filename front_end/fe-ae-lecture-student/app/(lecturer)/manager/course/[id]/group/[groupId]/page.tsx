"use client";

import GroupDetailsPanel from "@/app/(lecturer)/manager/course/[id]/components/GroupDetailsPanel";
import { useGroupById } from "@/hooks/group/useGroupById";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GroupDetailPage() {
  const params = useParams() as { id: string; groupId: string };
  const router = useRouter();
  const { data, loading, error, fetchGroupById } = useGroupById();

  useEffect(() => {
    if (params?.groupId) fetchGroupById(params.groupId);
  }, [params?.groupId, fetchGroupById]);

  return (
    <div className="p-3">
      <div className="mb-3">
        <button className="text-sm text-emerald-600 underline"   onClick={() => router.back()}>
          ← Back
        </button>
      </div>

      {loading && <div className="text-sm text-slate-500">Loading group...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      {data && <GroupDetailsPanel group={data} onClose={() => router.push(`/manager/course/${params.id}`)} />}
    </div>
  );
}

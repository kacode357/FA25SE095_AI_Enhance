"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAllMembers } from "@/hooks/group-member/useAllMembers";
import { useAssignLead } from "@/hooks/group-member/useAssignLead";
import { useDeleteMember } from "@/hooks/group-member/useDeleteMember";
import { useGroupById } from "@/hooks/group/useGroupById";
import { GroupMember } from "@/types/group-members/group-member.response";
import {
  ArrowLeft,
  CalendarClock,
  Info,
  Lock,
  User,
  UserRoundMinus,
  UserRoundPen,
  UserRoundPlus,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import AddMemberSheet from "./components/AddMemberSheet";

export default function GroupDetailPage(props?: { groupId?: string; courseId?: string; onDone?: () => void }) {
  // allow using this component inline by passing props; otherwise fallback to route params
  const params = useParams() as { id?: string; groupId?: string };
  const courseId = props?.courseId ?? params.id ?? "";
  const groupId = props?.groupId ?? params.groupId ?? "";
  const router = useRouter();
  const { data: group, loading, error, fetchGroupById } = useGroupById();
  const { members, loading: membersLoading, fetchAllMembers } = useAllMembers();
  const { deleteMember, loading: deleting } = useDeleteMember();

  const [openAddMember, setOpenAddMember] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);

  const { assignLead, loading: assigning } = useAssignLead();
  const [leaderModalOpen, setLeaderModalOpen] = useState(false);
  const [selectedLeader, setSelectedLeader] = useState<string | null>(null);

  useEffect(() => {
    if (groupId) {
      fetchGroupById(groupId);
      fetchAllMembers(groupId);
    }
  }, [groupId, fetchGroupById, fetchAllMembers]);

  if (loading || membersLoading)
    return <div className="text-slate-500 text-sm">Loading group details...</div>;
  if (error) return <div className="text-red-500 text-sm">Error: {error}</div>;
  if (!group) return <div className="text-slate-500 text-sm">Group not found.</div>;

  const handleDeleteClick = (member: GroupMember) => {
    setSelectedMember(member);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedMember) return;
    const res = await deleteMember({ groupId, studentId: selectedMember.studentId });
    if (res?.success) {
      toast.success(res.message);
      fetchAllMembers(groupId);
    } else {
      toast.error(res?.message || "Delete failed");
    }
    setConfirmOpen(false);
    setSelectedMember(null);
  };

  const openLeaderModal = () => {
    setSelectedLeader(group?.leaderId || null);
    setLeaderModalOpen(true);
  };

  const handleConfirmLeader = async () => {
    if (!selectedLeader || !groupId) return;
    const res = await assignLead({ groupId, studentId: selectedLeader });
    if (res?.success) {
      setLeaderModalOpen(false);
      fetchAllMembers(groupId);
      fetchGroupById(groupId);
    }
  };

  return (
    <div className="space-y-6 py-4">
      {props?.onDone && (
        <div className="flex items-center justify-between">
          <h2 className="text-base text-slate-900">Group Details</h2>
          <Button variant="ghost" className="text-violet-800 hover:text-violet-500" onClick={props.onDone}>
            <ArrowLeft className="size-4 " /> Back
          </Button>
        </div>
      )}

      {/* Content Layout */}
      <div className="grid grid-cols-1 border border-slate-200 mb-10 -mt-4 rounded-md p-2 gap-3 lg:grid-cols-[45%_55%]">
        {/* ==== Left Column ==== */}
        <section className="bg-white max-h-[calc(100vh-280px)] overflow-auto p-3 rounded-sm">
          <h3 className="text-sm font-semibold text-violet-800 flex items-center gap-2 mb-5">
            <Info className="size-4" /> Group Overview
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 text-xs text-slate-700">
            <InfoItem label="Group ID" value={group.id} />
            <InfoItem label="Group Name" value={group.name} />
            <InfoItem label="Course Name" value={group.courseName} />
            <InfoItem label="Description" value={group.description || "—"} />
            <InfoItem label="Max Members" value={group.maxMembers?.toString() || "—"} />
            <InfoItem label="Current Members" value={group.memberCount?.toString() || "—"} />
            <InfoItem
              label="Locked"
              value={
                group.isLocked ? (
                  <span className="text-red-600 flex items-center gap-1">
                    <Lock className="size-4" /> Yes
                  </span>
                ) : (
                  "No"
                )
              }
            />
          </div>

          <h3 className="text-sm font-semibold text-violet-800 flex items-center gap-2 mt-8 mb-5">
            <User className="size-4" /> Leader & Assignment
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 text-xs text-slate-700">
            <InfoItem label="Leader Name" value={group.leaderName || "—"} />
            <InfoItem label="Leader ID" value={group.leaderId || "—"} />
            <InfoItem label="Assignment Title" value={group.assignmentTitle || "—"} />
            <InfoItem label="Assignment ID" value={group.assignmentId || "—"} />
          </div>

          <h3 className="text-xs font-semibold text-violet-800 flex items-center gap-2 mt-10 mb-5">
            <CalendarClock className="size-4" /> Metadata
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-x-6 gap-y-5 text-xs text-slate-700">
            <InfoItem label="Course ID" value={group.courseId} />
            <InfoItem label="Created At" value={new Date(group.createdAt).toLocaleString()} />
          </div>
        </section>

        {/* ==== Right Column (Members) ==== */}
        <section className="rounded-lg p-4 shadow-sm bg-white max-h-[calc(100vh-280px)] overflow-auto">
          <div className="flex items-center mb-3 justify-between">
            <h3 className="text-sm font-semibold text-violet-800 flex items-center gap-2">
              <User className="size-4" /> Members
            </h3>
            <button
              onClick={() => setOpenAddMember(true)}
              className="flex items-center gap-1 cursor-pointer text-sm text-emerald-600 hover:text-emerald-800"
            >
              <UserRoundPlus className="size-4" />
              Add Members
            </button>
          </div>

          {members.length === 0 ? (
            <div className="text-slate-500 text-sm italic">No members found in this group.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-slate-200">
                <thead className="bg-slate-50 text-slate-700 font-medium">
                  <tr>
                    <th className="px-3 text-xs py-2 text-left">Name</th>
                    <th className="px-3 text-xs py-2 text-left">Email</th>
                    <th className="px-3 text-xs py-2 text-center">Role</th>
                    <th
                      className="px-2 text-xs cursor-pointer py-2 flex gap-1 text-center"
                      onClick={openLeaderModal}
                    >
                      Leader <UserRoundPen color="#059669" className="size-4" />
                    </th>

                    <th className="px-3 text-xs py-2  text-center">Joined At</th>
                    <th className="px-3 text-xs py-2 text-center">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m: GroupMember) => (
                    <tr key={m.id} className="border-t text-xs border-slate-200">
                      <td className="px-3 py-2">{m.studentName}</td>
                      <td className="px-3 py-2">{m.studentEmail}</td>
                      <td className="px-0 py-2 text-center">
                        {m.isLeader || m.studentId === selectedLeader ? "Leader" : "Member"}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {m.isLeader || m.studentId === selectedLeader ? (
                          <span className="text-emerald-600 font-medium">Yes</span>
                        ) : (
                          "No"
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">{new Date(m.joinedAt).toLocaleString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                      <td className="px-3 py-2 text-center flex justify-center gap-2">
                        <button
                          title="Delete"
                          className="text-red-600 cursor-pointer hover:text-red-800"
                          onClick={() => handleDeleteClick(m)}
                        >
                          <UserRoundMinus className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}
        </section>
      </div>

      <AddMemberSheet
        open={openAddMember}
        onOpenChange={(v) => setOpenAddMember(v)}
        groupId={groupId}
        courseId={courseId}
        existingMemberIds={members.map((m) => m.studentId)}
        groupHasLeader={members.some((m) => m.isLeader)}
        onAdded={() => fetchAllMembers(groupId)}
      />

      {/* Confirm Delete Modal */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{selectedMember?.studentName}</span>?
          </div>
          <DialogFooter className="flex gap-3">
            <Button
              className="cursor-pointer"
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              className="cursor-pointer"
              onClick={handleConfirmDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={leaderModalOpen} onOpenChange={setLeaderModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Group Leader</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="mb-2 text-sm text-slate-600">Set a new group Leader:</p>
            <div className="flex flex-col gap-2 max-h-60 overflow-auto">
              {members.map((m: GroupMember) => (
                <label key={m.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="leader"
                    value={m.studentId}
                    checked={selectedLeader === m.studentId}
                    onChange={() => setSelectedLeader(m.studentId)}
                    className="cursor-pointer"
                  />
                  <span>{m.studentName} {m.isLeader ? "(Current Leader)" : ""}</span>
                </label>
              ))}
            </div>
          </div>
          <DialogFooter className="flex gap-3 mt-4">
            <Button className="cursor-pointer" variant="ghost" onClick={() => setLeaderModalOpen(false)} disabled={assigning}>
              Cancel
            </Button>
            <Button className="cursor-pointer" onClick={handleConfirmLeader} disabled={assigning || !selectedLeader}>
              {assigning ? "Assigning..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="text-slate-500 font-medium">{label}</span>
      <span className="text-slate-800 break-all">{value}</span>
    </div>
  );
}

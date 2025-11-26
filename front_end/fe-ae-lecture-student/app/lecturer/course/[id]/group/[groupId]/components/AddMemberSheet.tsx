"use client";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCourseStudents } from "@/hooks/enrollments/useCourseStudents";
// bulk add + assign lead hooks used below
import { useAddGroupMembers } from "@/hooks/group-member/useAddGroupMembers";
import { useAssignLead } from "@/hooks/group-member/useAssignLead";
import { useGroupsByCourseId } from "@/hooks/group/useGroupsByCourseId";
import { GroupMembersService } from "@/services/group-member.services";
import { UserRoundPen, UserRoundX } from "lucide-react";
import { useEffect, useState } from "react";

interface AddGroupMemberSheetProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    groupId: string;
    courseId: string;
    existingMemberIds?: string[];
    groupHasLeader?: boolean;
    onAdded?: () => void;
}

export default function AddGroupMemberSheet({
    open,
    onOpenChange,
    groupId,
    courseId,
    existingMemberIds = [],
    groupHasLeader = false,
    onAdded,
}: AddGroupMemberSheetProps) {
    const { addGroupMembers } = useAddGroupMembers();
    const { assignLead } = useAssignLead();
    const { students, loading: enrollmentsLoading, fetchCourseStudents } = useCourseStudents(courseId);
    const { listData: groups, loading: groupsLoading, fetchByCourseId } = useGroupsByCourseId();

    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [leaderId, setLeaderId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [occupiedStudentIds, setOccupiedStudentIds] = useState<Set<string>>(new Set());
    const [occupiedLoading, setOccupiedLoading] = useState(false);

    useEffect(() => {
        if (open && courseId) fetchCourseStudents(courseId);
    }, [open, courseId, fetchCourseStudents]);

    // Fetch groups for the course and then load members for each other group
    useEffect(() => {
        if (!open || !courseId) return;

        let mounted = true;

        const load = async () => {
            try {
                setOccupiedLoading(true);
                await fetchByCourseId(courseId);

                // ensure we have latest groups and use the returned response
                const res = await fetchByCourseId(courseId);

                // collect other group ids (exclude current groupId)
                const otherGroupIds = (res?.groups || [])
                    .map((g) => g.id)
                    .filter((id) => id && id !== groupId);

                const sets: string[] = [];

                // fetch members for each other group concurrently
                const promises = otherGroupIds.map((gid) => GroupMembersService.getAllMembers(gid).then((res) => res?.members ?? []));
                const results = await Promise.all(promises);

                const occupied = new Set<string>();
                results.forEach((members) => {
                    (members || []).forEach((m) => {
                        if (m?.studentId) occupied.add(m.studentId);
                    });
                });

                if (mounted) setOccupiedStudentIds(occupied);
            } catch (err) {
                // ignore errors; occupied set will be empty
                if (mounted) setOccupiedStudentIds(new Set());
            } finally {
                if (mounted) setOccupiedLoading(false);
            }
        };

        load();

        return () => {
            mounted = false;
        };
    }, [open, courseId, groupId, fetchByCourseId, groups]);

    // Reset form khi đóng
    useEffect(() => {
        if (!open) {
            setSelectedStudents([]);
            setLeaderId(null);
            setError(null);
        }
    }, [open]);

    // Use all students returned by the hook (do not filter by status)
    const activeStudents = students ?? [];
    // Lọc ra những student chưa có trong group và chưa thuộc nhóm khác
    const availableStudents = activeStudents.filter((s) => {
        if (existingMemberIds.includes(s.studentId)) return false;
        if (occupiedStudentIds.has(s.studentId)) return false;
        return true;
    });

    // (debug logs removed)

    // When selectedStudents change:
    // - Do not auto-assign a leader on student selection generally.
    // - BUT when the leader-selection UI appears (no existing group leader and
    //   at least one selected student), auto-select the first selected student
    //   as the default leader so the radio has a sensible default.
    useEffect(() => {
        if (selectedStudents.length === 0) {
            setLeaderId(null);
            return;
        }

        // If the leader-selection panel is visible (no groupHasLeader) and
        // we don't have a leader chosen yet, pick the first selected student
        // as the default selection.
        if (!groupHasLeader && !leaderId && selectedStudents.length > 0) {
            setLeaderId(selectedStudents[0]);
            return;
        }

        // If a previously chosen leader was unselected, clear leaderId
        if (leaderId && !selectedStudents.includes(leaderId)) {
            setLeaderId(null);
        }
    }, [selectedStudents, leaderId, groupHasLeader]);

    const canSubmit = selectedStudents.length > 0;

    const toggleStudent = (id: string) => {
        setSelectedStudents((prev) =>
            prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
        );
        // Nếu leader bị unselect thì reset leaderId
        if (leaderId === id) setLeaderId(null);
    };

    const selectAll = () => {
        const allIds = availableStudents.map((s) => s.studentId);
        setSelectedStudents(allIds);
    };
    const clearAll = () => {
        setSelectedStudents([]);
        setLeaderId(null);
    };

    const handleSubmit = async () => {
        if (!canSubmit || submitting) return;
        setError(null);
        setSubmitting(true);

        try {
            // Use bulk endpoint so backend returns a single success/error message
            const res = await addGroupMembers({ groupId, studentIds: selectedStudents });

            if (!res) {
                setError("Failed to add members");
                setSubmitting(false);
                return;
            }

            // If a leader was selected and the group doesn't already have one,
            // call assign leader (this hook will show backend message toasts).
            if (leaderId && !groupHasLeader) {
                await assignLead({ groupId, studentId: leaderId });
            }

            onAdded?.();
            onOpenChange(false);
        } catch (e: any) {
            setError(e?.message || "Failed to add member");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="bg-white border-white w-full sm:max-w-xl md:max-w-xl h-full flex flex-col">
                <SheetHeader>
                    <SheetTitle className="text-[#000D83]">Add New Member</SheetTitle>
                </SheetHeader>

                <div className="px-4 pb-4 space-y-3 flex-1 overflow-auto">
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-2">{error}</div>
                    )}

                    {/* Multi-select Students */}
                    <div>
                        <div className="flex justify-between">
                            <div>
                                <Label className="py-2 cursor-text">Students                                 
                                    <div className="text-sm text-slate-500 font-normal">({availableStudents.length} / {students?.length ?? 0})</div></Label>
                            </div>
                            <div className="flex gap-1 mb-2">
                                <Button size="xs" className="text-[#000D83] cursor-pointer !bg-violet-50" variant="ghost" onClick={selectAll} disabled={enrollmentsLoading}>
                                    Select All
                                </Button>
                                <Button size="xs" className="text-[#000D83] cursor-pointer" variant="ghost" onClick={clearAll} disabled={enrollmentsLoading}>
                                    Clear
                                </Button>
                            </div>
                        </div>

                        <Command className="w-full max-h-[60vh] overflow-auto">
                            <CommandInput placeholder={enrollmentsLoading ? "Loading..." : "Search students..."} />
                            <CommandEmpty>
                                <div className="flex gap-2 items-center italic justify-center">
                                    <UserRoundX className="size-4" /> No students found.
                                </div>
                            </CommandEmpty>
                            <CommandGroup>
                                {availableStudents.map((s) => (
                                    <CommandItem key={s.studentId} onSelect={() => toggleStudent(s.studentId)}>
                                        <input
                                            placeholder="Checkbox"
                                            type="checkbox"
                                            checked={selectedStudents.includes(s.studentId)}
                                            readOnly
                                            className="mr-2 cursor-pointer"
                                        />
                                        <div className="cursor-pointer">{s.fullName ?? `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim()} ({s.studentIdNumber ?? s.studentId})</div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </Command>

                        {/* Selected tags */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {selectedStudents.map((id) => {
                                const s = availableStudents.find((st) => st.studentId === id);
                                if (!s) return null;
                                return (
                                    <div key={id} className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                                        {s.fullName ?? `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim()}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Leader selection */}
                    {selectedStudents.length > 0 && !groupHasLeader && (
                        <div className="mt-2">
                            <Label className="pt-4 cursor-text text-[#059669] pb-3">
                                <UserRoundPen color="#059669" className="size-4" /> Set a Group Leader
                            </Label>
                            <div className="flex flex-col text-sm gap-1">
                                {selectedStudents.map((id) => {
                                    const s = availableStudents.find((st) => st.studentId === id);
                                    if (!s) return null;
                                    return (
                                        <label key={id} className="flex cursor-pointer items-center ml-3 gap-2">
                                            <input
                                                type="radio"
                                                name="leader"
                                                value={id}
                                                checked={id === leaderId}
                                                onChange={() => setLeaderId(id)}
                                                className="cursor-pointer"
                                            />
                                            {s.fullName}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {groupHasLeader && selectedStudents.length > 0 && (
                        <div className="mt-2 text-sm text-slate-500 italic">
                            * This group already has a leader. You can assign a new leader within the group.
                        </div>
                    )}
                </div>

                <SheetFooter className="flex flex-row gap-5 justify-start">
                    <Button className="cursor-pointer btn btn-gradient-slow" onClick={handleSubmit} disabled={!canSubmit || submitting}>
                        {submitting ? "Adding..." : "Add Members"}
                    </Button>
                    <Button className="cursor-pointer text-violet-800 hover:text-violet-500" variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
                        Cancel
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

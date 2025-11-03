"use client";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCourseEnrollments } from "@/hooks/course/useCourseEnrollments";
import { useAddGroupMember } from "@/hooks/group-member/useAddGroupMember";
import { AddGroupMemberPayload, MemberRole } from "@/types/group-members/group-member.payload";
import { UserRoundPen, UserRoundX } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
    const { addGroupMember } = useAddGroupMember();
    const { data: enrollments, loading: enrollmentsLoading, fetchEnrollments } = useCourseEnrollments();

    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [leaderId, setLeaderId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Load enrollments khi mở sheet
    useEffect(() => {
        if (open && courseId) fetchEnrollments(courseId);
    }, [open, courseId]);

    // Reset form khi đóng
    useEffect(() => {
        if (!open) {
            setSelectedStudents([]);
            setLeaderId(null);
            setError(null);
        }
    }, [open]);

    const activeStudents = enrollments?.enrollments.filter((e) => e.status === 1) || [];
    // Lọc ra những student chưa có trong group
    const availableStudents = activeStudents.filter((s) => !existingMemberIds.includes(s.studentId));

    // Khi selectedStudents thay đổi, set leader mặc định là học viên đầu tiên
    useEffect(() => {
        if (selectedStudents.length > 0 && !selectedStudents.includes(leaderId || "")) {
            setLeaderId(selectedStudents[0]);
        }
        if (selectedStudents.length === 0) {
            setLeaderId(null);
        }
    }, [selectedStudents]);

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
            for (const studentId of selectedStudents) {
                const payload: AddGroupMemberPayload = {
                    groupId,
                    studentId,
                    isLeader: studentId === leaderId,
                    role: MemberRole.Student,
                };
                await addGroupMember(payload, false); // không toast trong hook
            }

            toast.success("Members added successfully");
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
            <SheetContent className="bg-white w-full sm:max-w-xl md:max-w-2xl">
                <SheetHeader>
                    <SheetTitle className="text-[#000D83]">Add Member</SheetTitle>
                </SheetHeader>

                <div className="pb-4 px-4 space-y-3">
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-2">{error}</div>
                    )}

                    {/* Multi-select Students */}
                    <div>
                        <div className="flex justify-between">
                            <Label className="py-2 cursor-text">Students</Label>
                            <div className="flex gap-1 mb-2">
                                <Button size="xs" className="text-[#000D83] cursor-pointer !bg-emerald-50" variant="ghost" onClick={selectAll} disabled={enrollmentsLoading}>
                                    Select All
                                </Button>
                                <Button size="xs" className="text-[#000D83] cursor-pointer" variant="ghost" onClick={clearAll} disabled={enrollmentsLoading}>
                                    Clear
                                </Button>
                            </div>
                        </div>

                        <Command className="w-full max-h-60 overflow-auto">
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
                                        <div className="cursor-pointer">{s.studentName} ({s.studentId})</div>
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
                                    <div key={id} className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                                        {s.studentName}
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
                                            {s.studentName}
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

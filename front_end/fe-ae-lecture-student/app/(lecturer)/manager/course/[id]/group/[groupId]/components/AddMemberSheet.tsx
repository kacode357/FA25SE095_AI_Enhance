"use client";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCourseEnrollments } from "@/hooks/course/useCourseEnrollments";
import { useAddGroupMember } from "@/hooks/group-member/useAddGroupMember";
import { AddGroupMemberPayload, MemberRole } from "@/types/group-members/group-member.payload";
import { UserRoundPen } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface AddGroupMemberSheetProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    groupId: string;
    courseId: string;
    onAdded?: () => void;
}

export default function AddGroupMemberSheet({
    open,
    onOpenChange,
    groupId,
    courseId,
    onAdded,
}: AddGroupMemberSheetProps) {
    const { addGroupMember, loading } = useAddGroupMember();
    const { data: enrollments, loading: enrollmentsLoading, fetchEnrollments } = useCourseEnrollments();

    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [leaderId, setLeaderId] = useState<string | null>(null);
    const [notes, setNotes] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Load enrollments
    useEffect(() => {
        if (open && courseId) fetchEnrollments(courseId);
    }, [open, courseId]);

    // Reset form when closing
    useEffect(() => {
        if (!open) {
            setSelectedStudents([]);
            setLeaderId(null);
            setNotes("");
            setError(null);
        }
    }, [open]);

    // Khi selectedStudents thay đổi, set leader mặc định là học viên đầu tiên
    useEffect(() => {
        if (selectedStudents.length > 0 && !selectedStudents.includes(leaderId || "")) {
            setLeaderId(selectedStudents[0]);
        }
        if (selectedStudents.length === 0) {
            setLeaderId(null);
        }
    }, [selectedStudents]);

    const activeStudents = enrollments?.enrollments.filter((e) => e.status === 1) || [];
    const canSubmit = selectedStudents.length > 0;

    const toggleStudent = (id: string) => {
        setSelectedStudents((prev) =>
            prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
        );

        // Nếu leader bị unselect thì reset leaderId
        if (leaderId === id) setLeaderId(null);
    };

    const selectAll = () => {
        const allIds = activeStudents.map((s) => s.studentId);
        setSelectedStudents(allIds);
    };
    const clearAll = () => {
        setSelectedStudents([]);
        setLeaderId(null);
    };

    const handleSubmit = async () => {
        if (!canSubmit || loading) return;
        setError(null);

        try {
            for (const studentId of selectedStudents) {
                const payload: AddGroupMemberPayload = {
                    groupId,
                    studentId,
                    isLeader: studentId === leaderId,
                    role: MemberRole.Student,
                    notes: notes.trim(),
                };
                await addGroupMember(payload);
            }

            toast.success("Members added successfully");
            onAdded?.();
            onOpenChange(false);
        } catch (e: any) {
            setError(e?.message || "Failed to add member");
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="bg-white w-full sm:max-w-xl md:max-w-2xl">
                <SheetHeader>
                    <SheetTitle>Add Member</SheetTitle>
                </SheetHeader>

                <div className="pb-4 px-4 space-y-3">
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-2">
                            {error}
                        </div>
                    )}

                    {/* Multi-select Students */}
                    <div>
                        <div className="flex justify-between">
                            <Label className="py-2">Students</Label>
                            <div className="flex gap-1 mb-2">
                                <Button size="xs" className="!bg-emerald-50" variant="ghost" onClick={selectAll} disabled={enrollmentsLoading}>
                                    Select All
                                </Button>
                                <Button size="xs" variant="ghost" onClick={clearAll} disabled={enrollmentsLoading}>
                                    Clear
                                </Button>
                            </div>
                        </div>

                        <Command className="w-full max-h-60 overflow-auto">
                            <CommandInput placeholder={enrollmentsLoading ? "Loading..." : "Search students..."} />
                            <CommandEmpty>No students found.</CommandEmpty>
                            <CommandGroup>
                                {activeStudents.map((s) => (
                                    <CommandItem key={s.studentId} onSelect={() => toggleStudent(s.studentId)}>
                                        <input
                                            placeholder="Checkbox"
                                            type="checkbox"
                                            checked={selectedStudents.includes(s.studentId)}
                                            readOnly
                                            className="mr-2"
                                        />
                                        {s.studentName} ({s.studentId})
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </Command>

                        {/* Selected tags */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {selectedStudents.map((id) => {
                                const s = activeStudents.find((st) => st.studentId === id);
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
                    {selectedStudents.length > 0 && (
                        <div className="mt-2">
                            <Label className="pt-4 text-[#059669] pb-3"><UserRoundPen color="#059669" className="size-4" />Set a Group Leader</Label>
                            <div className="flex flex-col text-sm gap-1">
                                {selectedStudents.map((id) => {
                                    const s = activeStudents.find((st) => st.studentId === id);
                                    if (!s) return null;
                                    return (
                                        <label key={id} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="leader"
                                                value={id}
                                                checked={id === leaderId}
                                                onChange={() => setLeaderId(id)}
                                            />
                                            {s.studentName}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <Label htmlFor="notes" className="py-2">
                            Notes (optional)
                        </Label>
                        <Input
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Additional notes or remarks"
                            disabled={loading}
                        />
                    </div>
                </div>

                <SheetFooter className="flex flex-row gap-5 justify-start">
                    <Button onClick={handleSubmit} disabled={!canSubmit || loading}>
                        {loading ? "Adding..." : "Add Members"}
                    </Button>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

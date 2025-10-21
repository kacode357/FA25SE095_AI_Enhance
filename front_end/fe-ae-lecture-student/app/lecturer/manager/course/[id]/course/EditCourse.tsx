"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useGetCourseById } from "@/hooks/course/useGetCourseById";
import { useMyCourses } from "@/hooks/course/useMyCourses";
import { useUpdateCourse } from "@/hooks/course/useUpdateCourse";
import { useTerms } from "@/hooks/term/useTerms";
import { CourseStatus } from "@/types/courses/course.response";
import { AnimatePresence, motion } from "framer-motion";
import { FolderLock, Loader2, SquarePen, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import InactivateCourseDialog from "./components/InactivateCourseDialog";

export default function EditCourse() {
    const [editMode, setEditMode] = useState(false);
    const [selectedTermId, setSelectedTermId] = useState<string>("");
    const [year, setYear] = useState<string>("");
    const [description, setDescription] = useState("");

    const { listData: myCourses, fetchMyCourses } = useMyCourses();
    const { data: terms, fetchTerms } = useTerms();
    const { updateCourse, loading: updating } = useUpdateCourse();
    const { id } = useParams<{ id: string }>();
    const { data: course, loading, error, fetchCourseById, refetch } = useGetCourseById();
    const [inactivateOpen, setInactivateOpen] = useState(false);

    useEffect(() => {
        if (id) fetchCourseById(id);
    }, [id]);

    useEffect(() => {
        if (editMode && course) {
            Promise.all([
                fetchMyCourses?.({ asLecturer: true }, true),
                fetchTerms?.()
            ]).catch(() => { });

            setYear(course?.year?.toString() || "");
            setDescription(course?.description || "");
        }
    }, [editMode, course]);

    useEffect(() => {
        if (terms && course) {
            const matchedTerm = terms.find(
                (t) => t.name.toLowerCase() === course.term?.toLowerCase()
            );
            if (matchedTerm) {
                setSelectedTermId(matchedTerm.id);
            }
        }
    }, [terms, course]);

    const handleSave = async () => {
        if (!id) return;

        try {
            // updateCourse expects a single UpdateCoursePayload object
            await updateCourse({
                courseId: id,
                termId: selectedTermId,
                year: Number(year),
                description,
            });

            await refetch(id);
            setEditMode(false);
        } catch (err) {
            console.error("Failed to update course:", err);
        }
    };

    function getStatusLabel(status: CourseStatus): string {
        switch (status) {
            case CourseStatus.PendingApproval:
                return "Pending Approval";
            case CourseStatus.Active:
                return "Active";
            case CourseStatus.Inactive:
                return "Inactive";
            case CourseStatus.Rejected:
                return "Rejected";
            default:
                return "Unknown";
        }
    }

    function getStatusColor(status: CourseStatus): string {
        switch (status) {
            case CourseStatus.PendingApproval:
                return "bg-yellow-100 text-yellow-800 border border-yellow-300";
            case CourseStatus.Active:
                return "bg-emerald-100 text-emerald-800 border border-emerald-300";
            case CourseStatus.Inactive:
                return "bg-slate-100 text-slate-700 border border-slate-300";
            case CourseStatus.Rejected:
                return "bg-red-100 text-red-700 border border-red-300";
            default:
                return "bg-slate-100 text-slate-700 border border-slate-300";
        }
    }

    if (loading) {
        return (
            <div className="h-[60vh] grid place-items-center">
                <Loader2 className="h-6 w-6 text-slate-500 animate-spin" />
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="h-[60vh] grid place-items-center text-slate-500">
                <div className="text-center">
                    <p className="mb-2">Failed to load course details.</p>
                    <Button variant="outline" onClick={() => refetch(id)}>
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col px-6 py-5 overflow-hidden bg-slate-50">
            <InactivateCourseDialog
                open={inactivateOpen}
                onOpenChange={setInactivateOpen}
                courseId={id || ""}
                courseName={course?.name}
                lecturerId={course?.lecturerId}
                onConfirmed={async () => {
                    await refetch(id);
                }}
            />
            {/* Breadcrumb */}
            <nav className="flex flex-row justify-between items-center text-sm mb-5 gap-2" aria-label="Breadcrumb">
                <div className="flex flex-row justify-between items-center text-sm gap-2">
                    <a
                        href="/lecturer/manager/course"
                        className="text-emerald-500 hover:underline cursor-pointer"
                    >
                        Courses
                    </a>
                    <span className="text-slate-400">/</span>
                    <span className="text-emerald-800 font-semibold">{course.name}</span>
                </div>
                {course?.status === CourseStatus.Active && (
                    <div>
                        <button
                            title="Lock"
                            onClick={() => setInactivateOpen(true)}
                            className="bg-amber-700 text-white flex gap-2 cursor-pointer items-center px-4 py-2 rounded-md text-sm font-medium
               hover:bg-amber-800 hover:shadow-md active:scale-95
               transition-all duration-200 ease-in-out"
                        >
                            <FolderLock className="size-4" /> Inactivate Course
                        </button>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <div className="flex flex-1 flex-col md:flex-row gap-6 overflow-hidden">
                {/* LEFT */}
                <Card className="flex-[0.65] flex flex-col p-6 border-slate-200 shadow-sm overflow-auto">
                    <div className="flex justify-between items-center mb-5">
                        <h3 className="text-base font-semibold text-slate-700">
                            General Information
                        </h3>
                        {!editMode ? (
                            course?.status === CourseStatus.Active ? (
                                <SquarePen
                                    role="button"
                                    aria-label="Edit course"
                                    className="size-5 cursor-pointer text-emerald-600 hover:text-emerald-700 transition"
                                    onClick={() => setEditMode(true)}
                                />
                            ) : null
                        ) : (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditMode(false)}
                            >
                                <X className="w-4 h-4 text-slate-500" />
                            </Button>
                        )}
                    </div>

                    <AnimatePresence mode="wait">
                        {!editMode ? (
                            <motion.div
                                key="view"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-5"
                            >
                                <div className="grid grid-cols-2 gap-x-6 gap-y-7 text-sm">
                                    <InfoV2 label="Course Code" value={course.courseCode} />
                                    <InfoV2 label="Course Code Title" value={course.courseCodeTitle} />
                                    <InfoV2 label="Name" value={course.name} />
                                    <InfoV2 label="Term" value={course.term} />
                                    <InfoV2 label="Year" value={course.year.toString()} />
                                    <InfoV2 label="Department" value={course.department} />
                                    <InfoV2 label="Lecturer" value={course.lecturerName} />
                                    <InfoV2 label="Enrollment Count" value={course.enrollmentCount.toString()} />
                                    <InfoV2 label="Can Enroll" value={course.canEnroll ? "Yes" : "No"} />
                                    <InfoV2
                                        label="Created At"
                                        value={new Date(course.createdAt).toLocaleString("en-GB", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                        })}
                                    />
                                </div>

                                {course.description && (
                                    <div className="pt-10 border-t border-slate-200">
                                        <p className="text-slate-500 text-xs uppercase mb-1 tracking-wide">
                                            Description
                                        </p>
                                        <div className="!bg-white p-3 rounded-md border border-slate-200 text-slate-800 text-sm leading-relaxed">
                                            {course.description}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.form
                                key="edit"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-2 gap-x-6 gap-y-5 text-sm mt-1"
                            >
                                <div className="flex flex-col">
                                    <label className="text-slate-500 text-xs cursor-text uppercase mb-1">
                                        Name
                                    </label>
                                    <Input value={course.name} disabled className="!bg-slate-200 cursor-text" />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-slate-500 text-xs cursor-text uppercase mb-1">
                                        Term
                                    </label>
                                    <select
                                        title="Select"
                                        value={selectedTermId}
                                        onChange={(e) => setSelectedTermId(e.target.value)}
                                        className="border rounded-lg cursor-pointer border-slate-200 px-2 py-2.5 bg-white focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="">Select term</option>
                                        {terms?.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-slate-500 cursor-text text-xs uppercase mb-1">
                                        Year
                                    </label>
                                    <Input
                                        type="number"
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        placeholder="Enter year"
                                        className="focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>

                                <div className="flex flex-col col-span-2">
                                    <label className="text-slate-500 cursor-text text-xs uppercase mb-1">
                                        Description
                                    </label>
                                    <Textarea
                                        rows={3}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Enter course description..."
                                        className="resize-none bg-white focus:ring-2 focus:border-emerald-100 border rounded-lg border-slate-200 focus:ring-emerald-500"
                                    />
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <div className="mt-7 flex items-center justify-between">
                        <span className="text-slate-500 text-sm">Status</span>
                        <Badge
                            className={`${getStatusColor(
                                course.status
                            )} px-3 py-1 rounded-full font-medium text-xs`}
                        >
                            {getStatusLabel(course.status)}
                        </Badge>
                    </div>

                    {editMode && (
                        <div className="mt-4 border-t pb-5 border-slate-200 flex justify-end gap-2">
                            <Button
                                className="bg-emerald-600 mt-5 hover:bg-emerald-700 cursor-pointer text-white"
                                onClick={handleSave}
                                disabled={updating}
                            >
                                {updating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </div>
                    )}
                </Card>

                {/* RIGHT */}
                <div className="flex-[0.35] flex flex-col gap-5 overflow-auto">
                    <Card className="p-5 border-slate-200 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">
                            Access Code
                        </h3>
                        <div className="flex flex-col gap-2 text-sm">
                            <Info label="Requires Code" value={course.requiresAccessCode ? "Yes" : "No"} />
                            <Info label="Access Code" value={course.accessCode || "—"} mono />
                            <Info label="Access Code Created" value={course.accessCodeCreatedAt || "—"} />
                            <Info label="Access Code Expires At" value={course.accessCodeExpiresAt || "—"} />
                        </div>
                    </Card>

                    <Card className="p-5 border-slate-200 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">
                            Approval Details
                        </h3>
                        <div className="flex flex-col gap-2 text-sm">
                            <Info label="Approved By" value={course.approvedByName || "—"} />
                            <Info
                                label="Approved At"
                                value={
                                    course.approvedAt
                                        ? new Date(course.approvedAt).toLocaleString("en-GB", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                        })
                                        : "—"
                                }
                            />
                            <Info label="Comments" value={course.approvalComments || "—"} />
                            <Info label="Rejection Reason" value={course.rejectionReason || "—"} />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function Info({
    label,
    value,
    mono = false,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <p className="flex justify-between">
            <span className="text-slate-500">{label}:</span>
            <span
                className={`font-medium text-slate-800 ${mono ? "font-mono tracking-tight" : ""}`}
            >
                {value}
            </span>
        </p>
    );
}

function InfoV2({
    label,
    value,
    mono = false,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className="flex flex-col">
            <span className="text-slate-500 text-xs uppercase tracking-wide">{label}</span>
            <span
                className={`text-slate-800 font-medium ${mono ? "font-mono tracking-tight" : ""}`}
            >
                {value || "—"}
            </span>
        </div>
    );
}

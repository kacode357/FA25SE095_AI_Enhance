"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useGetAccessCodes } from "@/hooks/access-code/useGetAccessCodes";
import { useGetCourseById } from "@/hooks/course/useGetCourseById";
import { useMyCourses } from "@/hooks/course/useMyCourses";
import { useUpdateAccessCode } from "@/hooks/course/useUpdateAccessCode";
import { useUpdateCourse } from "@/hooks/course/useUpdateCourse";
import { useTerms } from "@/hooks/term/useTerms";
import { CourseStatus } from "@/types/courses/course.response";
import { AnimatePresence, motion } from "framer-motion";
import { Book, ChevronRight, FolderLock, Loader2, SquarePen, X } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import CourseSidebar from "./components/CourseSidebar"; // ĐÃ IMPORT
import { StatusChip } from "./components/CourseStatus";
import EditCourseForm from "./components/EditCourseForm";
import GeneralInfoView from "./components/GeneralInfoView";
import InactivateCourseDialog from "./components/InactivateCourseDialog";

export default function EditCourse() {
    const [editMode, setEditMode] = useState(false);
    const [selectedTermId, setSelectedTermId] = useState<string>("");
    const [year, setYear] = useState<string>("");
    const [description, setDescription] = useState("");
    const [announcement, setAnnouncement] = useState("");

    const [showAccessCode, setShowAccessCode] = useState(false);
    const [copied, setCopied] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [inactivateOpen, setInactivateOpen] = useState(false);

    const { listData: myCourses, fetchMyCourses } = useMyCourses();
    const { data: terms, fetchTerms } = useTerms();
    const { updateCourse, loading: updating } = useUpdateCourse();
    const { id } = useParams<{ id: string }>();
    const { data: course, loading, error, fetchCourseById, refetch } = useGetCourseById();
    const pathname = usePathname();
    const isEditRoute = pathname?.includes(`/lecturer/course/${id}/course`);

    const { data: access, loading: accessLoading, error: accessError } = useGetAccessCodes(id || undefined);
    const { updateAccessCode, loading: updatingAccess } = useUpdateAccessCode();

    const normalizeDateishToString = (v: any): string | null => {
        if (!v) return null;
        return typeof v === "string" ? v : v instanceof Date ? v.toISOString() : String(v);
    };

    useEffect(() => {
        if (id) fetchCourseById(id);
    }, [id]);

    useEffect(() => {
        if (editMode && course) {
            Promise.all([
                fetchMyCourses?.({ asLecturer: true }, true),
                fetchTerms?.()
            ]).catch(() => { });

            setDescription(course?.description || "");
            setAnnouncement(course?.announcement || "");
        }
    }, [editMode, course]);

    useEffect(() => {
        if (terms && course) {
            const matchedTerm = terms.find(
                (t) => t.name.toLowerCase() === course.term?.toLowerCase()
            );
            if (matchedTerm) setSelectedTermId(matchedTerm.id);
        }
    }, [terms, course]);

    const handleSave = async () => {
        if (!id) return;
        try {
            await updateCourse({
                courseId: id,
                termId: selectedTermId,
                year: Number(year),
                description,
                announcement: announcement || undefined,
            });
            await refetch(id);
            setEditMode(false);
        } catch (err) {
            console.error("Failed to update course:", err);
        }
    };

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
                    <Button variant="outline" onClick={() => id && refetch(id)}>Retry</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col max-w-7xl mx-auto overflow-hidden p-5">
            <InactivateCourseDialog
                open={inactivateOpen}
                onOpenChange={setInactivateOpen}
                courseId={id || ""}
                courseName={course?.name}
                lecturerId={course?.lecturerId}
                onConfirmed={() => id && refetch(id)}
            />

            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="text-[12px] select-none my-2">
                <div className="flex items-center justify-between mt-2">
                    <ol className="flex items-center gap-1 text-slate-500">
                        <li className="flex items-center hover:text-violet-800 cursor-pointer gap-1 ">
                            <Book className="size-4" />
                            <button
                                onClick={() => window.location.href = '/lecturer/course'}
                                className="px-1 cursor-pointer hover:text-violet-800 truncate max-w-[130px]"
                            >
                                My Courses
                            </button>
                        </li>
                        <ChevronRight className="size-3 text-slate-400 hidden sm:inline" />
                        <li className="text-slate-900 cursor-text font-medium truncate max-w-[200px]">
                            {course.courseCode} — {course.courseCodeTitle}
                        </li>
                    </ol>

                    {course.status !== CourseStatus.PendingApproval && (
                        <Link href={`/lecturer/course/${id}`}>
                            <Button size="sm" variant="outline" className="btn btn-gradient-slow text-violet-800">
                                In Course
                            </Button>
                        </Link>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex flex-1 flex-col md:flex-row gap-6 mt-2 mb-10 overflow-hidden">
                {/* LEFT: General Information */}
                <Card className="flex-[0.65] flex flex-col p-6 border-slate-200 bg-slate-50 shadow-sm overflow-auto">
                    <div className="flex justify-between items-center mb-5">
                        <div className="flex items-center gap-3">
                            <h3 className="text-base font-semibold text-slate-700">General Information</h3>
                            <StatusChip status={course.status} />
                        </div>

                        <div className="flex items-center gap-5">
                            {!editMode && course.status === CourseStatus.Active && (
                                <>
                                    <button
                                        onClick={() => setInactivateOpen(true)}
                                        className="flex items-center gap-2 px-3 cursor-pointer py-1.5 rounded-md text-xs font-medium border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100"
                                    >
                                        <FolderLock className="size-4" /> Inactivate
                                    </button>
                                    <SquarePen
                                        className="size-5 cursor-pointer text-violet-600 hover:text-violet-800"
                                        onClick={() => setEditMode(true)}
                                    />
                                </>
                            )}
                            {editMode && (
                                <Button variant="ghost" size="icon" onClick={() => setEditMode(false)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {!editMode ? (
                            <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <GeneralInfoView course={course} terms={terms} />
                            </motion.div>
                        ) : (
                            <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <EditCourseForm
                                    name={course?.name}
                                    selectedTermId={selectedTermId}
                                    setSelectedTermId={setSelectedTermId}
                                    year={year}
                                    setYear={setYear}
                                    description={description}
                                    setDescription={setDescription}
                                    announcement={announcement}
                                    setAnnouncement={setAnnouncement}
                                    terms={terms}
                                    handleSave={handleSave}
                                    updating={updating}
                                />
                                
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>

                {/* RIGHT: Sidebar */}
                <CourseSidebar
                    course={course}
                    access={access}
                    accessLoading={accessLoading}
                    accessError={accessError}
                    id={id}
                    updatingAccess={updatingAccess}
                    updateAccessCode={updateAccessCode}
                    refetch={refetch} // Type khớp 100%
                    normalizeDateishToString={normalizeDateishToString}
                    showAccessCode={showAccessCode}
                    setShowAccessCode={setShowAccessCode}
                    copied={copied}
                    setCopied={setCopied}
                    openUpdate={openUpdate}
                    setOpenUpdate={setOpenUpdate}
                />
            </div>
        </div>
    );
}
"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Select from "@/components/ui/select/Select";
import { Textarea } from "@/components/ui/textarea";
import { useGetAccessCodes } from "@/hooks/access-code/useGetAccessCodes";
import { useGetCourseById } from "@/hooks/course/useGetCourseById";
import { useMyCourses } from "@/hooks/course/useMyCourses";
import { useUpdateAccessCode } from "@/hooks/course/useUpdateAccessCode";
import { useUpdateCourse } from "@/hooks/course/useUpdateCourse";
import { useTerms } from "@/hooks/term/useTerms";
import { CourseStatus } from "@/types/courses/course.response";
import { AnimatePresence, motion } from "framer-motion";
import { Book, ChevronRight, ClipboardCopy, CloudDownload, Eye, EyeOff, FolderLock, Loader2, RefreshCw, SquarePen, X } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AccessCodeDialog from "../../components/AccessCodeDialog";
import InactivateCourseDialog from "./components/InactivateCourseDialog";
import LiteRichTextEditor from "@/components/common/TinyMCE";

export default function EditCourse() {
    const [editMode, setEditMode] = useState(false);
    const [selectedTermId, setSelectedTermId] = useState<string>("");
    const [year, setYear] = useState<string>("");
    const [description, setDescription] = useState("");
    const [announcement, setAnnouncement] = useState("");

    const { listData: myCourses, fetchMyCourses } = useMyCourses();
    const { data: terms, fetchTerms } = useTerms();
    const { updateCourse, loading: updating } = useUpdateCourse();
    const { id } = useParams<{ id: string }>();
    const { data: course, loading, error, fetchCourseById, refetch } = useGetCourseById();
    const pathname = usePathname();
    const isEditRoute = pathname?.includes(`/lecturer/course/${id}/course`);
    const { data: access, loading: accessLoading, error: accessError } = useGetAccessCodes(id || undefined);
    const { updateAccessCode, loading: updatingAccess, error: updateAccessError } = useUpdateAccessCode();
    const [inactivateOpen, setInactivateOpen] = useState(false);
    const [showAccessCode, setShowAccessCode] = useState(false);
    const [copied, setCopied] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);

    // Normalize possibly Date|string|null into string|null for AccessCodeDialog
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

            setYear(course?.year?.toString() || "");
            setDescription(course?.description || "");
            setAnnouncement(course?.announcement || "");
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
                announcement: announcement ?? undefined,
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
        <div className="h-screen flex flex-col px-6 overflow-hidden bg-slate-50">
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
            {/* Breadcrumb (styled like CreateCoursePage) */}
            <nav aria-label="Breadcrumb" className="text-[12px] select-none overflow-hidden mt-2 py-3 mr-3">
                <div className="flex items-center justify-between">
                    <ol className="flex items-center gap-1 text-slate-500 flex-nowrap overflow-hidden">
                        <li className="flex flex-row gap-0 hover:text-violet-800 items-center">
                            <Book className="size-4" />
                            <button
                                onClick={() => window.location.href = '/lecturer/course'}
                                className="px-1 py-0.5 cursor-pointer rounded hover:text-violet-800 transition max-w-[130px] truncate"
                            >
                                Courses Management
                            </button>
                        </li>
                        <ChevronRight className="size-3 text-slate-400 hidden sm:inline" />
                        <li className={isEditRoute ? "font-medium cursor-text text-slate-900 max-w-[150px] truncate" : "text-slate-500 max-w-[150px] truncate"}>
                            {course.courseCode} — {course.courseCodeTitle}
                        </li>
                    </ol>

                    {/* Hide View Students button when course is pending approval */}
                    {course.status !== CourseStatus.PendingApproval && (
                        <div className="flex items-center gap-2">
                            <Link href={id ? `/lecturer/course/${id}` : "#"} aria-label="Go to Course Detail Page" className={id ? "" : "pointer-events-none opacity-60"}>
                                <Button size="sm" variant="outline" className="cursor-pointer btn btn-gradient-slow text-violet-800 hover:text-violet-600">
                                    In Course
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex flex-1 flex-col md:flex-row gap-6 mr-3 overflow-hidden">
                {/* LEFT */}
                <Card className="flex-[0.65] flex flex-col p-6 mb-6 border-slate-200 shadow-sm overflow-auto">
                    <div className="flex justify-between items-center mb-5">
                        <div className="flex items-center gap-3">
                            <h3 className="text-base font-semibold text-slate-700">General Information</h3>
                            {/* Status chip shown to the right of the General Information title */}
                            <span
                                className={`px-2.5 py-1 text-xs rounded-full leading-none ${getStatusColor(course.status)}`}
                            >
                                {getStatusLabel(course.status)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {!editMode ? (
                                course?.status === CourseStatus.Active ? (
                                    <>
                                        {/* Inactivate button sits next to the Edit icon */}
                                        <button
                                            title="Inactivate Course"
                                            onClick={() => setInactivateOpen(true)}
                                            className="flex items-center gap-2 px-3 mr-4 py-1.5 rounded-md text-xs font-medium border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 hover:shadow-sm active:scale-95 transition-all duration-200 ease-in-out"
                                        >
                                            <FolderLock className="size-4" /> Inactivate
                                        </button>
                                        <SquarePen
                                            role="button"
                                            aria-label="Edit course"
                                            className="size-5 cursor-pointer text-violet-600 hover:text-violet-800 transition"
                                            onClick={() => setEditMode(true)}
                                        />
                                    </>
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
                                <div className="grid grid-cols-2 gap-x-6 gap-y-10 text-sm">
                                    <InfoV2 label="Course Code" value={course.courseCode} />
                                    <InfoV2 label="Course Code Title" value={course.courseCodeTitle} />
                                    <InfoV2 label="Name" value={course.name} />
                                    <InfoV2 label="Term" value={course.term} />
                                    {/* <InfoV2 label="Year" value={course.year.toString()} /> */}
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
                                    <InfoV2
                                        label="Ends"
                                        value={course.termEndDate
                                            ? new Date(course.termEndDate).toLocaleDateString("en-GB")
                                            : "-"}
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

                                {course.announcement && (
                                    <div className="pt-6">
                                        <p className="text-slate-500 text-xs uppercase mb-1 tracking-wide">
                                            Announcement
                                        </p>

                                        <div className="rounded-md border border-slate-200 bg-white">
                                            <LiteRichTextEditor
                                                value={course.announcement}
                                                onChange={() => { }}
                                                readOnly
                                                className="rounded-md overflow-hidden"
                                                placeholder="No announcement yet"
                                            />
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
                                className="grid grid-cols-2 gap-x-6 gap-y-10 text-sm mt-1"
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
                                    <Select<string>
                                        value={selectedTermId ?? ""}
                                        options={(terms ?? []).map((t: any) => ({ value: t.id, label: t.name }))}
                                        placeholder="Select term"
                                        onChange={(v) => setSelectedTermId(v)}
                                        className="w-full"
                                    />
                                </div>

                                {/* <div className="flex flex-col">
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
                                </div> */}

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
                                <div className="flex flex-col col-span-2">
                                    <label className="text-slate-500 cursor-text text-xs uppercase mb-1">
                                        Announcement (optional)
                                    </label>
                                    <Textarea
                                        rows={2}
                                        value={announcement}
                                        onChange={(e) => setAnnouncement(e.target.value)}
                                        placeholder="Enter announcement for students (optional)"
                                        className="resize-none bg-white focus:ring-2 focus:border-emerald-100 border rounded-lg border-slate-200 focus:ring-emerald-500"
                                    />
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>


                    {editMode && (
                        <div className="mt-4 border-t pb-5 border-slate-200 flex justify-end gap-2">
                            <Button
                                className="mt-5 btn btn-gradient-slow cursor-pointer text-white"
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
                <div className="flex-[0.35] flex flex-col gap-6.5 overflow-auto">
                    <Card className="flex p-5 border-slate-200 shadow-sm">
                        <div className="text-base">
                            {course?.syllabusFile ? (
                                typeof course.syllabusFile === "string" ? (
                                    <a
                                        href={course.syllabusFile}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-violet-900 justify-center hover:text-violet-500 flex font-bold items-center"
                                    >
                                        <CloudDownload className="size-4 mr-2" />Download Syllabus
                                    </a>
                                ) : (
                                    ((course.syllabusFile as any)?.url) ? (
                                        <a
                                            href={(course.syllabusFile as any).url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-violet-600 hover:text-violet-900"
                                        >
                                            {(course.syllabusFile as any).name || "Download syllabus"}
                                        </a>
                                    ) : (
                                        <span className="text-slate-600">{String((course.syllabusFile as any).name ?? course.syllabusFile)}</span>
                                    )
                                )
                            ) : (
                                <span className="text-slate-500">No syllabus</span>
                            )}
                        </div>
                    </Card>

                    <Card className="p-5 border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-[#000D83]">Access Code</h3>
                            {id && (
                                <Button
                                    size="sm"
                                    variant={access?.requiresAccessCode ? "destructive" : "outline"}
                                    className="-m-3 text-violet-800 hover:text-violet-500"
                                    onClick={async () => {
                                        if (!id) return;
                                        const enable = !(access?.requiresAccessCode ?? course.requiresAccessCode);
                                        try {
                                            await updateAccessCode(id, { requiresAccessCode: enable, regenerateCode: enable });
                                            await refetch(id);
                                        } catch (e) {
                                            console.error("Failed to update access code:", e);
                                        }
                                    }}
                                    disabled={updatingAccess}
                                >
                                    {updatingAccess ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : access?.requiresAccessCode ?? course.requiresAccessCode ? (
                                        "Disable"
                                    ) : (
                                        "Enable"
                                    )}
                                </Button>
                            )}

                        </div>
                        <div className="flex flex-col gap-5 text-sm">
                            {accessLoading ? (
                                <p className="text-slate-500">Loading access code...</p>
                            ) : accessError ? (
                                <p className="text-red-500">Failed to load access code</p>
                            ) : access ? (
                                <>
                                    <Info label="Requires Code" value={access.requiresAccessCode ? "Yes" : "No"} />
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500">Access Code:</span>
                                        <div className="flex items-center gap-4">
                                            <span
                                                className={`font-medium font-mono tracking-tight ${showAccessCode ? "text-slate-800" : "text-slate-400"
                                                    }`}
                                            >
                                                {showAccessCode ? access.accessCode || "—" : "•••••••"}
                                            </span>
                                            {access.accessCode && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAccessCode((prev) => !prev)}
                                                    className="text-slate-500 hover:text-slate-700 transition"
                                                    title={showAccessCode ? "Hide code" : "Show code"}
                                                >
                                                    {showAccessCode ? <EyeOff className="w-6 bg-slate-100 p-1 rounded-lg h-6" /> : <Eye className="w-6 bg-slate-100 p-1 rounded-lg h-6" />}
                                                </button>
                                            )}
                                            {access.accessCode && (
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        try {
                                                            await navigator.clipboard.writeText(access.accessCode!);
                                                            setCopied(true);
                                                            setTimeout(() => setCopied(false), 1200);
                                                        } catch { }
                                                    }}
                                                    className="text-slate-500 hover:text-slate-700 transition"
                                                    title={copied ? "Copied!" : "Copy code"}
                                                >
                                                    <ClipboardCopy className="w-4 h-4" />
                                                </button>
                                            )}
                                            {(access.requiresAccessCode ?? course.requiresAccessCode) && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => setOpenUpdate(true)}
                                                        className="text-slate-600 hover:text-slate-800 transition"
                                                        title="Regenerate / update access code"
                                                    >
                                                        <RefreshCw className="w-4 h-4" />
                                                    </button>
                                                    <Dialog open={openUpdate} onOpenChange={setOpenUpdate}>
                                                        <AccessCodeDialog
                                                            courseId={id!}
                                                            defaultType={undefined}
                                                            defaultCustom={(access?.accessCode ?? course.accessCode) || undefined}
                                                            defaultExpiresAt={normalizeDateishToString(access?.accessCodeExpiresAt ?? course.accessCodeExpiresAt)}
                                                            open={openUpdate}
                                                            onOpenChange={setOpenUpdate}
                                                            onUpdated={async () => {
                                                                await refetch(id);
                                                            }}
                                                        />
                                                    </Dialog>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <Info
                                        label="Access Code Created"
                                        value={access.accessCodeCreatedAt
                                            ? new Date(access.accessCodeCreatedAt).toLocaleString("en-GB", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                second: "2-digit",
                                            })
                                            : "—"}
                                    />
                                    <Info
                                        label="Access Code Expires At"
                                        value={access.accessCodeExpiresAt
                                            ? new Date(access.accessCodeExpiresAt).toLocaleString("en-GB", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                second: "2-digit",
                                            })
                                            : "—"}
                                    />
                                    <Info label="Is Expired" value={access.isExpired ? "Yes" : "No"} />
                                    <Info label="Failed Attempts" value={String(access.failedAttempts ?? 0)} />
                                </>
                            ) : (
                                <>
                                    <Info label="Requires Code" value={course.requiresAccessCode ? "Yes" : "No"} />
                                    <Info label="Access Code" value={course.accessCode || "—"} mono />
                                    <Info
                                        label="Access Code Created"
                                        value={course.accessCodeCreatedAt
                                            ? new Date(course.accessCodeCreatedAt).toLocaleString("en-GB", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                second: "2-digit",
                                            })
                                            : "—"}
                                    />
                                    <Info
                                        label="Access Code Expires At"
                                        value={course.accessCodeExpiresAt
                                            ? new Date(course.accessCodeExpiresAt).toLocaleString("en-GB", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                second: "2-digit",
                                            })
                                            : "—"}
                                    />
                                </>
                            )}
                        </div>
                    </Card>

                    <Card className="p-5 border-slate-200 shadow-sm">
                        <h3 className="text-sm font-semibold text-[#000D83]">
                            Approval Details
                        </h3>
                        <div className="flex flex-col gap-5 text-sm">
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

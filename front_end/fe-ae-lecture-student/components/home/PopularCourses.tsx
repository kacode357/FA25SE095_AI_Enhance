"use client";

import { useAvailableCourses } from "@/hooks/course/useAvailableCourses";
import { AvailableCourseItem } from "@/types/courses/course.response";
import { BookOpen, ChevronLeft, ChevronRight, ChevronsRight, Clock, KeyRound, Lock, PlayCircle, PlusCircle, Unlock, Users } from "lucide-react";
// use a regular <img> fallback to avoid next/image domain config issues
import { useRouter } from "next/navigation"; // ✅ thêm dòng này
import { useEffect, useRef } from "react";

type CTAIntent = "go" | "join" | "join-code" | "pending";
type CTAState = {
    label: string;
    intent: CTAIntent;
    disabled: boolean;
};

const getCTA = (course: AvailableCourseItem): CTAState => {
    const status = (course.enrollmentStatus?.status || "").toLowerCase();
    const isEnrolled = !!course.enrollmentStatus?.isEnrolled;
    const canJoin = course.canJoin ?? true;

    if (isEnrolled) return { label: "Go to Course", intent: "go", disabled: false };
    if (status === "pending" || status === "pendingapproval") {
        return { label: "Pending Approval", intent: "pending", disabled: true };
    }

    if (course.requiresAccessCode) {
        return {
            label: "Join with Code",
            intent: "join-code",
            disabled: !!course.isAccessCodeExpired || !canJoin,
        };
    }

    if (!canJoin) return { label: "Join", intent: "join", disabled: true };

    return { label: "Join", intent: "join", disabled: false };
};

const buildJoinParams = (course: AvailableCourseItem) => {
    const params = new URLSearchParams();
    const title = `${course.courseCode}${course.description ? ` - ${course.description}` : ""}`;
    params.set("title", title);
    if (course.lecturerName) params.set("lecturer", course.lecturerName);
    if (course.uniqueCode) params.set("classCode", course.uniqueCode);
    return params.toString();
};

interface AvailableCoursesSectionProps {
    courses?: AvailableCourseItem[];
}

export default function AvailableCoursesSection({
    courses,
}: AvailableCoursesSectionProps) {
    const { listData, loading, fetchAvailableCourses } = useAvailableCourses();
    const scrollRef = useRef<HTMLDivElement>(null);
    const router = useRouter(); // ✅ thêm dòng này

    useEffect(() => {
        if (!courses || courses.length === 0) {
            fetchAvailableCourses({ page: 1, pageSize: 4, sortBy: "EnrollmentCount", sortDirection: "desc" });
        }
    }, [courses, fetchAvailableCourses]);

    const items = courses && courses.length > 0 ? courses : listData;

    const DEFAULT_IMAGE_URL =
        "https://i.postimg.cc/VL3PwwpK/Gemini-Generated-Image-pu4lm6pu4lm6pu4l.png";

    const handleCTA = (course: AvailableCourseItem) => {
        const cta = getCTA(course);
        if (cta.disabled) return;

        const isEnrolled = !!course.enrollmentStatus?.isEnrolled;
        if (isEnrolled) {
            router.push(`/student/courses/${course.id}`);
            return;
        }

        if (course.requiresAccessCode) {
            router.push(`/student/all-courses/${course.id}/join?${buildJoinParams(course)}`);
            return;
        }

        if (course.joinUrl) {
            window.open(course.joinUrl, "_blank", "noopener,noreferrer");
            return;
        }

        router.push(`/student/courses/${course.id}`);
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-[#fff7f9] via-[#f3e8ff] to-[#e0f2fe] py-20">
            <div className="container px-6 mx-auto text-center">
                {/* Header */}
                <div className="mb-12">
                    <button className="px-5 py-2 mb-4 text-sm font-medium text-white rounded-full shadow-md bg-gradient-to-r from-purple-500 to-indigo-500">
                        Available Courses
                    </button>
                    <h2 className="mb-4 text-4xl font-bold md:text-5xl">
                        <span className="text-transparent bg-gradient-to-r from-teal-400 via-purple-500 to-pink-500 bg-clip-text">
                            Courses Currently Running
                        </span>
                    </h2>
                    <p className="max-w-2xl mx-auto text-slate-500">
                        You can join the courses that are going on.
                    </p>
                </div>

                {/* Course List */}
                <div className="relative">
                    <div
                        ref={scrollRef}
                        className="flex gap-8 px-2 pb-5 overflow-x-auto no-scrollbar scroll-smooth"
                    >
                        {loading && items.length === 0 && (
                            <div className="w-full text-center text-slate-500">Loading courses...</div>
                        )}

                        {!loading && items.length === 0 && (
                            <div className="w-full text-center text-slate-500">No courses available.</div>
                        )}

                        {items.map((course) => (
                            <div
                                key={course.id}
                                className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all overflow-hidden text-left relative min-w-[280px] max-w-[320px] flex-shrink-0"
                            >
                                {/* Thumbnail */}
                                <div className="relative px-5 pt-6">
                                    <img
                                        src={course.img ?? DEFAULT_IMAGE_URL}
                                        alt={course.name ?? "course thumbnail"}
                                        width={400}
                                        height={250}
                                        className="object-cover w-full border-2 h-52 rounded-2xl border-violet-300"
                                        onError={(e) => {
                                            const t = e.currentTarget as HTMLImageElement;
                                            if (t.src !== DEFAULT_IMAGE_URL) t.src = DEFAULT_IMAGE_URL;
                                        }}
                                    />

                                    {/* Access Code badge */}
                                    <span
                                        className={`absolute top-3 right-3 flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${course.requiresAccessCode
                                            ? "bg-amber-500 text-white"
                                            : "bg-emerald-500 text-white"
                                            }`}
                                    >
                                        {course.requiresAccessCode ? (
                                            <>
                                                <Lock className="w-3 h-3" /> Access Code
                                            </>
                                        ) : (
                                            <>
                                                <Unlock className="w-3 h-3" /> Public
                                            </>
                                        )}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="p-6 space-y-3">
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span className="font-semibold">{course.courseCode}</span>
                                        <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                                    </div>

                                    <h3 className="text-base font-bold leading-snug transition text-slate-800 hover:text-purple-600 line-clamp-2">
                                        {course.courseCode} - {course.lecturerName}
                                    </h3>

                                    <p className="text-sm text-slate-500 line-clamp-2">
                                        {course.description || "No description provided."}
                                    </p>

                                    <div className="flex items-center justify-between mt-3 text-sm text-slate-600">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-4 h-4 text-sky-500" />
                                            {course.enrollmentCount} enrolled
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <BookOpen className="w-4 h-4 text-emerald-500" />
                                            {course.enrollmentStatus?.status ?? "Not Enrolled"}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={`https://i.pravatar.cc/40?u=${course.lecturerId}`}
                                                alt={course.lecturerName}
                                                className="w-8 h-8 border rounded-full"
                                            />
                                            <span className="text-sm font-medium text-slate-800">
                                                {course.lecturerName}
                                            </span>
                                        </div>

                                        {(() => {
                                            const cta = getCTA(course);
                                            const icon =
                                                cta.intent === "go" ? (
                                                    <PlayCircle className="w-3.5 h-3.5" />
                                                ) : cta.intent === "join-code" ? (
                                                    <KeyRound className="w-3.5 h-3.5" />
                                                ) : cta.intent === "pending" ? (
                                                    <Clock className="w-3.5 h-3.5" />
                                                ) : (
                                                    <PlusCircle className="w-3.5 h-3.5" />
                                                );

                                            return (
                                                <button
                                                    type="button"
                                                    disabled={cta.disabled}
                                                    onClick={() => handleCTA(course)}
                                                    className={`text-sm font-semibold btn btn-gradient text-white bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-1.5 rounded-full hover:opacity-90 transition inline-flex items-center gap-1 ${cta.disabled ? "opacity-60 cursor-not-allowed" : ""
                                                        }`}
                                                >
                                                    {icon}
                                                    <span>{cta.label}</span>
                                                </button>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Prev / Next buttons */}
                    {items.length > 4 && (
                        <>
                            <button
                                title="Prev"
                                onClick={() =>
                                    scrollRef.current?.scrollBy({ left: -350, behavior: "smooth" })
                                }
                                className="absolute left-0 p-3 text-white -translate-y-1/2 bg-purple-500 rounded-full shadow-lg top-1/2 hover:bg-purple-600"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>

                            <button
                                title="Next"
                                onClick={() =>
                                    scrollRef.current?.scrollBy({ left: 350, behavior: "smooth" })
                                }
                                className="absolute right-0 p-3 text-white -translate-y-1/2 bg-purple-500 rounded-full shadow-lg top-1/2 hover:bg-purple-600"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </>
                    )}
                </div>

                {/* ✅ Nút chuyển trang */}
                <div className="flex justify-center mt-5">
                    <button
                        title="View All"
                        onClick={() => router.push("/student/home")} // ✅ thêm sự kiện
                        className="group inline-flex cursor-pointer items-center gap-0.5 text-violet-500 hover:underline hover:decoration-violet-500 hover:underline-offset-4 transition-all"
                    >
                        <span className="group-hover:underline group-hover:decoration-violet-500 group-hover:underline-offset-4">
                            View All Courses
                        </span>
                        <ChevronsRight
                            className="w-5 h-5 transition-transform duration-200 group-hover:animate-wiggle group-hover:underline group-hover:decoration-violet-500"
                        />
                    </button>
                </div>
            </div>
        </section>
    );
}

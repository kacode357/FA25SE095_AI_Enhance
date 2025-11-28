"use client";

import LiteRichTextEditor from "@/components/common/TinyMCE";
import { CourseItem } from "@/types/courses/course.response";
import { InfoV2 } from "../helpers/InfoHelpers";

type Props = {
    course: CourseItem;
    terms?: any[];
};

export default function GeneralInfoView({ course }: Props) {
    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 text-sm">
                <InfoV2 label="Course Code" value={course.courseCode} />
                <InfoV2 label="Course Code Title" value={course.courseCodeTitle} />
                <InfoV2 label="Name" value={course.name} />
                <InfoV2 label="Term" value={course.term} />
                <InfoV2 label="Department" value={course.department} />
                <InfoV2 label="Lecturer" value={course.lecturerName} />
                <InfoV2 label="Enrollment Count" value={course.enrollmentCount?.toString() ?? "0"} />
                {/* CourseItem type may not declare `canEnroll` in this package; safely read it */}
                <InfoV2
                    label="Can Enroll"
                    value={(Boolean((course as any).canEnroll) ? "Yes" : "No")}
                />
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
                    value={course.termEndDate ? new Date(course.termEndDate).toLocaleDateString("en-GB") : "-"}
                />
            </div>

            {course.description && (
                <div className="pt-10 border-t border-slate-200">
                    <p className="text-slate-500 text-xs uppercase mb-1 tracking-wide">Description</p>
                    <div className="!bg-white p-3 rounded-md border border-slate-200 text-slate-800 text-sm leading-relaxed">
                        {course.description}
                    </div>
                </div>
            )}

            <div className="pt-6">
                <p className="text-slate-500 text-xs uppercase mb-1 tracking-wide">Announcement</p>
                <div className="rounded-md border border-slate-200 bg-white">
                    {course.announcement ? (
                        <LiteRichTextEditor
                            value={course.announcement}
                            onChange={() => { }}
                            readOnly
                            className="rounded-md overflow-hidden"
                            placeholder="Not updated yet"
                        />
                    ) : (
                        <div className="p-3 italic text-sm text-slate-500">Not updated yet</div>
                    )}
                </div>
            </div>
        </div>
    );
}

"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function LegacyReportRedirectPage() {
    const params = useParams();
    const sp = useSearchParams();
    const router = useRouter();

    const reportId = typeof params?.reportId === "string" ? params.reportId : "";
    const courseId = sp?.get("courseId") || sp?.get("id") || "";

    useEffect(() => {
        if (!reportId) return;
        if (courseId) {
            router.replace(`/lecturer/course/${courseId}/reports/${reportId}`);
            return;
        }

        router.replace(`/lecturer/course/reports/${reportId}?courseId=${courseId}`);
    }, [reportId, courseId, router]);

    return (
        <div className="p-6">
            <div className="text-slate-600">Going to report details...</div>
        </div>
    );
}

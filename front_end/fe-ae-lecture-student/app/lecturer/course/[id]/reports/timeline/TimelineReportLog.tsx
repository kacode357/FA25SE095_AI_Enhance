"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCourseStudents } from '@/hooks/enrollments/useCourseStudents';
import { useGetReportTimeline } from "@/hooks/reports/useGetReportTimeline";
import { ReportTimelineItem } from "@/types/reports/reports.response";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
    reportId: string;
    courseId?: string;
}

export default function TimelineReportLog({ reportId, courseId = '' }: Props) {
    const { getReportTimeline, loading } = useGetReportTimeline();
    const { students: courseStudents, fetchCourseStudents } = useCourseStudents(courseId);
    const [data, setData] = useState<{ reportId: string; timeline: ReportTimelineItem[] } | null>(null);

    useEffect(() => {
        const fetch = async () => {
            if (!reportId) return;
            const res = await getReportTimeline({ reportId });
            if (res) setData(res);
        };
        fetch();
    }, [reportId]);

    useEffect(() => {
        if (!courseId) return;

        fetchCourseStudents(courseId).catch(() => {});
    }, [courseId, fetchCourseStudents]);

    const items = data?.timeline ?? [];

    return (
        <Card className="shadow-sm -my-6 -mx-6 py-4 border-none">
            <CardContent className="border-none -mt-3 pt-2">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold">Timeline</h3>
                        <div className="text-xs text-slate-500 mt-1">Report ID: <span className="font-mono">{reportId}</span></div>
                    </div>
                </div>

                {loading && (
                    <div className="flex items-center justify-center p-6 text-slate-600">
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading timeline...
                    </div>
                )}

                {!loading && items.length === 0 && (
                    <div className="text-sm text-slate-600">No timeline entries found for this report.</div>
                )}

                {!loading && items.length > 0 && (
                    <div className="space-y-4">
                        {items.map((it, idx) => (
                            <article key={idx} className="p-4 border rounded-lg bg-white border-slate-100 shadow-sm">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <div className="text-sm font-medium">{
                                                (() => {
                                                    const actorId = it.actor ?? '';
                                                    if (!actorId) return '—';
                                                    const s = courseStudents?.find((c) => c.studentId === actorId);
                                                    if (s) return s.fullName || `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() || actorId;
                                                    return actorId;
                                                })()
                                            }</div>
                                            <div className="text-xs text-slate-400">{it.action ?? '—'}</div>
                                            <div className="text-xs text-slate-400">{typeof it.version === 'number' ? `v${it.version}` : ''}</div>
                                        </div>

                                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                                            <div>
                                                <div className="text-xs mb-1 text-slate-500">Timestamp</div>
                                                <div className="font-mono text-sm">{it.timestamp ? new Date(it.timestamp).toLocaleString() : '—'}</div>
                                                {it.timestamp && (
                                                    <div className="text-xs text-slate-400">{formatDistanceToNow(parseISO(it.timestamp), { addSuffix: true })}</div>
                                                )}
                                            </div>

                                            <div className="md:col-span-1">
                                                <div className="text-xs text-slate-500">Details</div>
                                                <div className="text-sm text-slate-700 whitespace-pre-wrap mt-1">{it.details ?? '—'}</div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                                <Separator />
                            </article>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

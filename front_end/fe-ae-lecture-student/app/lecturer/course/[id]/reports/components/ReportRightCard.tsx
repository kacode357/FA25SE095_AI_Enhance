"use client";

import StatusBadge from "../utils/status";

interface Props {
    report: any;
}

export default function ReportRightCard({ report }: Props) {
    return (
        <div className="flex-shrink-0">
            <div className="bg-white flex border justify-around border-slate-100 rounded-xl p-4 shadow-sm flex-row items-center text-center gap-3">
                <div className="flex flex-col gap-2">
                    <div className="text-xs text-slate-500">Group submission</div>
                    <div className="font-medium">{report.isGroupSubmission ? 'Yes' : 'No'}</div>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="text-xs text-slate-500">Status</div>
                    <div className=""><StatusBadge status={report.status} /></div>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="text-xs text-slate-500">Version</div>
                    <div className="font-medium">{report.version}</div>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="text-xs text-slate-500">Grade</div>
                    <div className="font-semibold text-slate-900">{report.grade ?? <span className="italic text-slate-400 font-normal text-sm">Not updated yet</span>}</div>
                </div>
            </div>
        </div>
    );
}

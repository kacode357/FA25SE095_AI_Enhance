"use client";

import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";

interface Props {
    assignmentTitle: string;
    count: number;
    hasGraded: boolean;
    exporting: boolean;
    assignmentId: string;
    exportGrades: (assignmentId: string) => void;
    showExport?: boolean;
}

export default function penReportsHeader({ assignmentTitle, count, hasGraded, exporting, assignmentId, exportGrades, showExport = true }: Props) {
    return (
        <>
            <div>
                <div className="flex gap-1 items-end">
                    <h2 className="text-sm font-normal text-slate-600"> Reports for - </h2>
                    <div className="text-base text-slate-900 mt-1">{assignmentTitle}</div>
                </div>
            </div>
            {hasGraded && showExport && (
                <Button
                    className="bg-green-100 shadow-lg text-sm text-green-900"
                    onClick={() => exportGrades(assignmentId)}
                    disabled={!assignmentId || exporting}
                >
                    {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileDown className="size-4" />}
                    Export Grade
                </Button>
            )}
        </>
    );
}

"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { ClipboardCopy, CloudDownload, Eye, EyeOff, Loader2, RefreshCw } from "lucide-react";
import AccessCodeDialog from "../../../components/AccessCodeDialog";
import { Info } from "../helpers/Info";

type Props = {
    course: any;
    access: any;
    accessLoading: boolean;
    accessError: any;
    id?: string;
    updatingAccess: boolean;
    updateAccessCode: (courseId: string, payload: any) => Promise<any>;
    refetch: (id: string) => Promise<any>;
    normalizeDateishToString: (v: any) => string | null;

    showAccessCode: boolean;
    setShowAccessCode: React.Dispatch<React.SetStateAction<boolean>>;
    copied: boolean;
    setCopied: React.Dispatch<React.SetStateAction<boolean>>;
    openUpdate: boolean;
    setOpenUpdate: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function CourseSidebar({
    course,
    access,
    accessLoading,
    accessError,
    id,
    updatingAccess,
    updateAccessCode,
    refetch,
    normalizeDateishToString,
    showAccessCode,
    setShowAccessCode,
    copied,
    setCopied,
    openUpdate,
    setOpenUpdate,
}: Props) {
    const isCurrentlyEnabled = access?.requiresAccessCode ?? course.requiresAccessCode;

    // Hàm format ngày an toàn – trả về string
    const formatDate = (date: any): string => {
        if (!date) return "—";
        try {
            return new Date(date).toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "Invalid date";
        }
    };

    return (
        <div className="flex-[0.35] flex flex-col justify-between gap-6 overflow-auto">
            {/* Syllabus */}
            <Card className="p-5 border-slate-200 shadow-sm">
                <div className="text-base font-medium">
                    {course?.syllabusFile ? (
                        typeof course.syllabusFile === "string" ? (
                            <a
                                href={course.syllabusFile}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-violet-900 hover:text-violet-700 font-semibold"
                            >
                                <CloudDownload className="size-4" /> Download Syllabus
                            </a>
                        ) : (course.syllabusFile as any)?.url ? (
                            <a
                                href={(course.syllabusFile as any).url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-violet-600 hover:text-violet-900"
                            >
                                {(course.syllabusFile as any).name || "Download syllabus"}
                            </a>
                        ) : (
                            <span className="text-slate-600">
                                {String((course.syllabusFile as any).name ?? "File")}
                            </span>
                        )
                    ) : (
                        <span className="text-slate-500 italic">No syllabus uploaded</span>
                    )}
                </div>
            </Card>

            {/* Access Code */}
            <Card className="p-5 border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-[#000D83]">Access Code</h3>
                    {id && (
                        <Button
                            size="sm"
                            variant={isCurrentlyEnabled ? "destructive" : "outline"}
                            onClick={async () => {
                                const enable = !isCurrentlyEnabled;
                                await updateAccessCode(id, {
                                    requiresAccessCode: enable,
                                    regenerateCode: enable,
                                });
                                await refetch(id);
                            }}
                            disabled={updatingAccess}
                        >
                            {updatingAccess ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : isCurrentlyEnabled ? (
                                "Disable"
                            ) : (
                                "Enable"
                            )}
                        </Button>
                    )}
                </div>

                <div className="space-y-5 text-sm">
                    {accessLoading ? (
                        <p className="text-slate-500">Loading access code...</p>
                    ) : accessError ? (
                        <p className="text-red-500">Failed to load access code</p>
                    ) : access ? (
                        <>
                            <Info label="Requires Code" value={access.requiresAccessCode ? "Yes" : "No"} />

                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Code:</span>
                                <div className="flex items-center gap-3">
                                    <code className={`font-mono ${showAccessCode ? "text-slate-900" : "text-slate-400"}`}>
                                        {showAccessCode ? access.accessCode || "—" : "•••••••"}
                                    </code>

                                    {access.accessCode && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setShowAccessCode(prev => !prev)}
                                                className="text-slate-500 hover:text-slate-700"
                                            >
                                                {showAccessCode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    try {
                                                        await navigator.clipboard.writeText(access.accessCode!);
                                                        setCopied(true);
                                                        setTimeout(() => setCopied(false), 1500);
                                                    } catch { }
                                                }}
                                                className="text-slate-500 hover:text-slate-700"
                                            >
                                                <ClipboardCopy className="w-4 h-4" />
                                                {copied && <span className="ml-1 text-xs text-green-600">Copied!</span>}
                                            </button>

                                            {access.requiresAccessCode && (
                                                <button
                                                    title="Button"
                                                    type="button"
                                                    onClick={() => setOpenUpdate(true)}
                                                    className="text-slate-600 hover:text-slate-800"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            <Info label="Created" value={formatDate(access.accessCodeCreatedAt)} />
                            <Info label="Expires" value={formatDate(access.accessCodeExpiresAt) || "Never"} />
                            <Info label="Expired" value={access.isExpired ? "Yes" : "No"} />
                            <Info label="Failed Attempts" value={String(access.failedAttempts ?? 0)} />
                        </>
                    ) : (
                        <>
                            <Info label="Requires Code" value={course.requiresAccessCode ? "Yes" : "No"} />
                            <Info label="Access Code" value={course.accessCode || "—"} />
                        </>
                    )}
                </div>
            </Card>

            {/* Approval Details */}
            <Card className="p-5 border-slate-200 shadow-sm">
                <h3 className="text-sm font-semibold text-[#000D83] mb-4">Approval Details</h3>
                <div className="space-y-4 text-sm">
                    <Info label="Approved By" value={course.approvedByName || "—"} />

                    {/* ĐÃ SỬA HOÀN TOÀN DÒNG NÀY – KHÔNG CÒN LỖI BUILD */}
                    <Info label="Approved At" value={formatDate(course.approvedAt)} />

                    <Info label="Comments" value={course.approvalComments || "—"} />
                    <Info label="Rejection Reason" value={course.rejectionReason || "—"} />
                </div>
            </Card>

            {/* Dialog */}
            <Dialog open={openUpdate} onOpenChange={setOpenUpdate}>
                <AccessCodeDialog
                    courseId={id!}
                    defaultType={undefined}
                    defaultCustom={access?.accessCode ?? course.accessCode}
                    defaultExpiresAt={normalizeDateishToString(access?.accessCodeExpiresAt ?? course.accessCodeExpiresAt)}
                    open={openUpdate}
                    onOpenChange={setOpenUpdate}
                    onUpdated={() => id && refetch(id)}
                />
            </Dialog>
        </div>
    );
}
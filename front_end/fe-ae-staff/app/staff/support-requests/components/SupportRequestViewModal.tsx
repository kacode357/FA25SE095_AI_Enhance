"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { SupportRequestStatus } from "@/config/classroom-service/support-request-status.enum";
import type { SupportRequestItem } from "@/types/support/support-request.response";
import { formatToVN } from "@/utils/datetime/time";
import SupportRequestRejectButton from "./SupportRequestRejectButton";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: SupportRequestItem | null;
    onAccept?: (id: string) => Promise<void>;
    onReload?: () => Promise<void> | void;
    actionLoading?: boolean;
    /** When true, hide the Reject button (e.g. for assigned list view) */
    hideReject?: boolean;
};

const dt = (s?: string | null) => {
    if (!s) return "";
    try {
        return formatToVN(s, { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
    } catch (err) {
        const d = new Date(s as string);
        return Number.isNaN(d.getTime()) ? (s as string) : d.toLocaleString("en-GB");
    }
};

export default function SupportRequestViewModal({ open, onOpenChange, item, onAccept, onReload, actionLoading, hideReject }: Props) {
    const images: { src: string; label: string }[] = (() => {
        if (!item || !item.images) return [];

        let raw: any = item.images as any;
        if (typeof raw === "string") {
            const trimmed = raw.trim();
            // Attempt to parse JSON arrays or objects
            if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || (trimmed.startsWith("{") && trimmed.endsWith("}"))) {
                try {
                    raw = JSON.parse(trimmed);
                } catch {
                    // keep as string if parse fails
                }
            }
        }

        const arr = Array.isArray(raw) ? raw : [raw];
        const pick = (v: any) => {
            if (typeof v === "string") {
                const src = v;
                const parts = src.split("/");
                const label = parts[parts.length - 1] || src;
                return { src, label };
            }
            // try common keys
            const src = v?.url || v?.fileUrl || v?.path || v?.src || (v?.fileName ? String(v.fileName) : JSON.stringify(v));
            const label = v?.fileName || v?.name || (typeof src === "string" ? src.split("/").pop() || String(src) : String(src));
            return { src: String(src), label };
        };
        return arr.map(pick);
    })();

    return (
        <Dialog open={open} onOpenChange={(v) => onOpenChange(v)}>
            <DialogContent className="max-w-2xl border-slate-200 overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Support request details</DialogTitle>
                    <DialogDescription>Full information for the selected support request.</DialogDescription>
                </DialogHeader>

                {item ? (
                    <div className="space-y-3 py-2 text-sm text-slate-700 max-h-[60vh] overflow-auto pr-2">
                        <div>
                            <div className="text-xs font-medium text-gray-900">Subject</div>
                            <div className="text-[13px]">{item.subject}</div>
                        </div>

                        {item.description && (
                            <div>
                                <div className="text-xs font-medium text-gray-900">Description</div>
                                <div className="text-[13px] text-gray-600 whitespace-pre-wrap">{item.description}</div>
                            </div>
                        )}

                        {images.length > 0 && (
                            <div>
                                <div className="text-xs font-medium text-gray-900">Images</div>
                                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="block overflow-hidden rounded border border-slate-200 bg-white">
                                            <a
                                                href={img.src}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block w-full h-24"
                                            >
                                                <img
                                                    src={img.src}
                                                    alt={img.label || `attachment-${idx + 1}`}
                                                    className="w-full h-24 object-cover cursor-pointer"
                                                    onError={(e) => {
                                                        // hide broken image and its link wrapper
                                                        const el = e.currentTarget as HTMLImageElement;
                                                        const wrapper = (el.closest && (el.closest('a') as HTMLElement)) || el.parentElement;
                                                        if (wrapper) wrapper.style.display = 'none';
                                                    }}
                                                />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* <div className="grid grid-cols-2 gap-3">
                            <div>
                                <div className="text-xs font-medium text-gray-900">Requester</div>
                                <div className="text-[13px]">{item.requesterName}</div>
                                <div className="text-[11px] text-gray-500">Role: {item.requesterRole}</div>
                            </div>

                            <div>
                                <div className="text-xs font-medium text-gray-900">Course</div>
                                <div className="text-[13px]">{item.courseName}</div>
                            </div>
                        </div> */}

                        {/* <div className="grid grid-cols-2 gap-3">
                            <div>
                                <div className="text-xs font-medium text-gray-900">Category</div>
                                <SupportRequestCategoryBadge category={item.category} />
                            </div>
                            <div>
                                <div className="text-xs font-medium text-gray-900">Priority</div>
                                <SupportRequestPriorityBadge priority={item.priority} />
                            </div>
                        </div> */}

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <div className="text-xs font-medium text-gray-900">Requested</div>
                                <div className="text-[11px] text-gray-500">{dt(item.requestedAt)}</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div />
                )}

                <DialogFooter className="flex gap-2 justify-end">

                    {item && onAccept && (
                        <Button
                            type="button"
                            className="h-9 px-3 text-xs btn btn-blue-slow"
                            onClick={async () => {
                                await onAccept(item.id);
                                onOpenChange(false);
                                if (onReload) await onReload();
                            }}
                        >
                            Accept
                        </Button>
                    )}

                    {item && !hideReject && item.status !== SupportRequestStatus.InProgress && (
                        <SupportRequestRejectButton
                            requestId={item.id}
                            disabled={actionLoading}
                            onRejected={async () => {
                                onOpenChange(false);
                                if (onReload) await onReload();
                            }}
                        />
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

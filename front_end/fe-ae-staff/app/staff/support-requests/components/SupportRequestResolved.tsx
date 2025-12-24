"use client";

type Props = {
    resolved: boolean;
    resolving?: boolean;
    onResolve: () => Promise<void> | void;
    supportRequestId?: string;
    className?: string;
    onQuickSend?: () => void;
};

export default function SupportRequestResolved({
    resolved,
    resolving = false,
    onResolve,
    className,
    onQuickSend,
}: Props) {
    // Nếu chưa resolved thì không hiển thị gì cả (vì đã bỏ text và icon)
    if (!resolved) return null;

    return (
        <div className={className ?? "mr-2 ml-20 flex items-center justify-end gap-4"}>
            <div className="flex items-start shadow-md p-2 rounded-md gap-3 cursor-default">
                {/* Đã bỏ hoàn toàn phần Icon */}
                
                {/* Content Section - Chỉ hiện Text khi đã Resolved */}
                <div>
                    <div className="text-sm md:text-sm font-semibold text-gray-900 leading-tight">
                        <span>The support request for this user has been resolved.</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                        <span>No further action is required.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
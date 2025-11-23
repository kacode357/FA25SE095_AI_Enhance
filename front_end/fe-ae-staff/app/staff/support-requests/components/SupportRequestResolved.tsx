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
    const clickable = !resolved && typeof onQuickSend === "function";

    return (
        <div className={className ?? "mr-2 ml-20 flex items-center justify-end gap-4"}>
            {clickable ? (
                <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onQuickSend && onQuickSend()}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onQuickSend && onQuickSend();
                        }
                    }}
                    className="flex items-start shadow-md p-2 rounded-md gap-3 cursor-pointer"
                >
                    {/* content */}
                    <div
                        className={
                            resolved
                                ? "flex items-center justify-center w-10 h-10 rounded-md bg-green-50 text-green-700"
                                : "flex items-center justify-center w-10 h-10 rounded-md bg-blue-50 text-blue-700"
                        }
                        aria-hidden
                    >
                        {resolved ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 00-1.414-1.414L8 11.172 4.707 7.879A1 1 0 003.293 9.293l4 4a1 1 0 001.414 0l8-8z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M18 10c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zM9 7a1 1 0 012 0v1a1 1 0 11-2 0V7zm1 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                            </svg>
                        )}
                    </div>

                    <div>
                        <div className="text-sm md:text-sm font-semibold text-gray-900 leading-tight">
                            {resolved ? (
                                <span>The support request for this user has been resolved.</span>
                            ) : (
                                <span>Has your need been resolved?</span>
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                            {resolved ? (
                                <span>No further action is required.</span>
                            ) : (
                                <span>Please confirm by clicking here to check.</span>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex items-start shadow-md p-2 rounded-md gap-3">
                    <div
                        className={
                            resolved
                                ? "flex items-center justify-center w-10 h-10 rounded-md bg-green-50 text-green-700"
                                : "flex items-center justify-center w-10 h-10 rounded-md bg-blue-50 text-blue-700"
                        }
                        aria-hidden
                    >
                        {resolved ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 00-1.414-1.414L8 11.172 4.707 7.879A1 1 0 003.293 9.293l4 4a1 1 0 001.414 0l8-8z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M18 10c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zM9 7a1 1 0 012 0v1a1 1 0 11-2 0V7zm1 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                            </svg>
                        )}
                    </div>

                    <div>
                        <div className="text-sm md:text-sm font-semibold text-gray-900 leading-tight">
                            {resolved ? (
                                <span>The support request for this user has been resolved.</span>
                            ) : (
                                <span>Has your need been resolved?</span>
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                            {resolved ? (
                                <span>No further action is required.</span>
                            ) : (
                                <span>Please confirm by clicking here to check.</span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

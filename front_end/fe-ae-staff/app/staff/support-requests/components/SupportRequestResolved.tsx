"use client";

import { Button } from "@/components/ui/button";

type Props = {
    resolved: boolean;
    resolving?: boolean;
    onResolve: () => Promise<void> | void;
    supportRequestId?: string;
    className?: string;
};

export default function SupportRequestResolved({
    resolved,
    resolving = false,
    onResolve,
    className,
}: Props) {
    return (
        <div className={className ?? "mt-2 flex items-center justify-between gap-4"}>
            <div className="text-sm text-muted-foreground">
                {resolved ? (
                    <span>The support request for this user has been resolved.</span>
                ) : (
                    <span>Has your need been resolved?</span>
                )}
            </div>

            <div>
                {resolved ? (
                    <Button size="sm" variant="ghost" disabled>
                        Status: Done
                    </Button>
                ) : (
                    <Button size="sm" onClick={onResolve} disabled={resolving}>
                        {resolving ? "Marking…" : "Mark resolved"}
                    </Button>
                )}
            </div>
        </div>
    );
}

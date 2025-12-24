"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import SupportRequestResolved from "./SupportRequestResolved";

type Props = {
    peerName: string;
    resolved: boolean;
    resolving: boolean;
    onResolve: () => Promise<void> | void;
    supportRequestId?: string;
    onQuickSend: () => void;
};

export default function SupportRequestChatHeader({
    peerName,
    resolved,
    resolving,
    onResolve,
    supportRequestId,
    onQuickSend,
}: Props) {
    const router = useRouter();
    return (
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    className="cursor-pointer"
                    size="sm"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <h3 className="text-lg font-semibold">{peerName || "User"}</h3>
            </div>
            <SupportRequestResolved
                resolved={resolved}
                resolving={resolving}
                onResolve={onResolve}
                supportRequestId={supportRequestId}
                onQuickSend={onQuickSend}
            />
        </div>
    );
}

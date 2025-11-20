"use client";

import SupportRequestChatWindow from "@/app/staff/support-requests/components/SupportRequestChatWindow";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ChatPage() {
    const search = useSearchParams();
    const router = useRouter();
    const { user } = useAuth();

    const courseId = search.get("courseId") ?? "";
    const peerId = search.get("peerId") ?? "";
    const peerName = search.get("peerName") ?? "";
    const conversationId = search.get("conversationId") ?? null;

    return (
        <div className="p-4 h-screen flex flex-col overflow-hidden">
            <div className="mb-4 flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <h3 className="text-lg font-semibold">Chat with {peerName || "User"}</h3>
            </div>

            {peerId ? (
                <div className="flex-1 overflow-hidden">
                    <SupportRequestChatWindow
                        courseId={courseId}
                        currentUserId={user?.id ?? null}
                        peerId={peerId}
                        peerName={peerName}
                        conversationId={conversationId ?? undefined}
                        onClose={() => router.back()}
                    />
                </div>
            ) : (
                <div className="text-sm text-gray-600">Missing peerId in query.</div>
            )}
        </div>
    );
}

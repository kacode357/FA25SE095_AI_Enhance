"use client";

import { ArrowLeft, ChevronRight, MessageCircle, Wrench } from "lucide-react";

type Props = {
    peerName: string;
    requestTitle: string | null;
    onBack: () => void;
    onOpenSupportRequests: () => void;
};

export default function ChatHeader({ peerName, requestTitle, onBack, onOpenSupportRequests }: Props) {
    return (
        <div className="mb-3 flex items-center gap-3">
            <button
                type="button"
                aria-label="Go back"
                title="Go back"
                onClick={onBack}
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--border)] bg-white text-slate-700"
            >
                <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-[var(--brand)]" />
                    <h1 className="text-base font-semibold text-nav">Support conversation</h1>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                    Chat with <span className="font-medium">{peerName}</span>
                </p>
            </div>

            {/* Breadcrumb on right (styled same as Create Support) */}
            <nav aria-label="Breadcrumb" className="ml-4 self-center text-sm text-slate-500 select-none overflow-hidden">
                <ol className="flex items-center gap-1 text-slate-500 flex-nowrap overflow-hidden">
                    <li className="flex flex-row gap-0 hover:text-violet-800 items-center">
                        <Wrench className="size-3.5" />
                        <button
                            onClick={onOpenSupportRequests}
                            className="px-1 text-xs py-0.5 cursor-pointer rounded hover:text-violet-800 transition max-w-[130px] truncate"
                        >
                            Support Requests
                        </button>
                    </li>
                    <ChevronRight className="size-3 text-slate-400 hidden sm:inline" />
                    <li className="font-medium cursor-text text-xs text-slate-900 max-w-[150px] truncate">{requestTitle ?? "Conversation"}</li>
                </ol>
            </nav>
        </div>
    );
}

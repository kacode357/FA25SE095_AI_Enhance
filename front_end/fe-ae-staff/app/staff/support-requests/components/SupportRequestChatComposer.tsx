"use client";

import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useRef, useState } from "react";

type Props = {
    input: string;
    setInput: (v: string) => void;
    onSend: () => Promise<void> | void;
    sending: boolean;
};

export default function SupportRequestChatComposer({ input, setInput, onSend, sending }: Props) {
    const invokingRef = useRef(false);
    const [locked, setLocked] = useState(false);

    const attemptSend = async () => {
        if (invokingRef.current) return;
        if (locked) return;
        if (sending) return;
        if (!input.trim()) return;

        try {
            invokingRef.current = true;
            setLocked(true);
            await onSend();
        } finally {
            // keep locked for a short debounce window to avoid double-invokes
            setTimeout(() => {
                invokingRef.current = false;
            }, 300);
            setTimeout(() => {
                setLocked(false);
            }, 350);
        }
    };

    return (
        <div className="flex items-center gap-3">
            <textarea
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm resize-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus:border-slate-300"
                rows={2}
                value={input}
                onChange={(e) => {
                    setInput(e.target.value);
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void attemptSend();
                    }
                }}
                placeholder="Type a message..."
            />
            <Button
                size="lg"
                className="rounded-md btn btn-green-slow"
                onClick={() => {
                    void attemptSend();
                }}
                disabled={sending || locked || !input.trim()}
                type="button"
            >
                {sending ? "Sending…" : "Send"} <Send className="size-5" />
            </Button>
        </div>
    );
}

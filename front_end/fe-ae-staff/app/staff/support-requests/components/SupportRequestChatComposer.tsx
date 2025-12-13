"use client";

import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

type Props = {
    input: string;
    setInput: (v: string) => void;
    onSend: () => Promise<void> | void;
    sending: boolean;
};

export default function SupportRequestChatComposer({ input, setInput, onSend, sending }: Props) {
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
                        void onSend();
                    }
                }}
                placeholder="Type a message..."
            />
            <Button
                size="lg"
                className="rounded-md btn btn-green-slow"
                onClick={onSend}
                disabled={sending || !input.trim()}
            >
                {sending ? "Sending…" : "Send"} <Send className="size-5" />
            </Button>
        </div>
    );
}

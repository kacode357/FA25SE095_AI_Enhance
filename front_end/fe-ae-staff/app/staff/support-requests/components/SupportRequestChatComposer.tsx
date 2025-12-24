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
                className="input flex-1 rounded-xl px-4 py-2 text-sm resize-none"
                rows={2}
                value={input}
                onChange={(e) => {
                    setInput(e.target.value);
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (!sending && input.trim()) {
                            void onSend();
                        }
                    }
                }}
                placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
            />
            <Button
                size="lg"
                className="rounded-md btn btn-gradient-slow"
                onClick={onSend}
                disabled={sending || !input.trim()}
            >
                {sending ? "Sending..." : "Send"} <Send className="size-5" />
            </Button>
        </div>
    );
}

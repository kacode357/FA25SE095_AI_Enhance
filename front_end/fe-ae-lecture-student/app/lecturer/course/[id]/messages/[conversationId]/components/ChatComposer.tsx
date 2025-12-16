"use client";

import { Info, Send } from "lucide-react";

const cx = (...a: Array<string | false | undefined>) =>
    a.filter(Boolean).join(" ");

export default function ChatComposer({
    input,
    setInput,
    onSend,
    sending,
    isResolved,
}: any) {
    return (
        <div className="sticky bottom-0 bg-[var(--card)] border-t border-[var(--border)] px-4 py-5 z-20">
            {isResolved ? (
                <div className="text-xs flex items-center gap-2 text-[var(--text-muted)]">
                    <Info className="size-4 text-violet-600" />This support request has been marked as <span className="font-semibold text-green-600">Resolved</span>. You can no longer send new messages in this conversation.
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <textarea
                        className="input flex-1 resize-none rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:ring-0"
                        rows={2}
                        placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                void onSend();
                            }
                        }}
                    />
                    <button
                        onClick={onSend}
                        disabled={sending || !input.trim()}
                        className={cx(
                            "btn btn-gradient-slow h-9 px-4 text-xs font-semibold",
                            sending || !input.trim()
                                ? "opacity-60 cursor-not-allowed"
                                : "",
                        )}
                    >
                        {sending ? "Sending…" : "Send"}
                        <Send className="size-4" />
                    </button>
                </div>
            )}
        </div>
    );
}

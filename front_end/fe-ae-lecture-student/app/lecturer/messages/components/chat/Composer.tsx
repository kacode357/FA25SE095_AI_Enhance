
type Props = {
    input: string;
    setInput: (v: string) => void;
    onSend: () => Promise<void> | void;
    sending: boolean;
};

export default function Composer({ input, setInput, onSend, sending }: Props) {
    return (
        <div className="p-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            void onSend();
                        }
                    }}
                    placeholder="Write a message..."
                    className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
                <button
                    disabled={sending}
                    onClick={() => void onSend()}
                    className="rounded-xl bg-black text-white px-4 py-2 text-sm disabled:opacity-50"
                >
                    Send
                </button>
            </div>
        </div>
    );
}

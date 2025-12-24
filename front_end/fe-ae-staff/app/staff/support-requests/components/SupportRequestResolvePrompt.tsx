"use client";

type Props = {
    onConfirm: () => Promise<void> | void;
    onDismiss?: () => void;
    message?: string;
};

export default function SupportRequestResolvePrompt({ onConfirm, onDismiss, message }: Props) {
    return (
        <div className="w-full flex justify-center">
            <div className="max-w-lg w-full px-4">
                <div className="bg-gradient-to-r from-white/60 via-white to-slate-50 border border-slate-100 shadow-lg rounded-3xl px-5 py-3 flex items-center gap-4 justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                            <div className="w-10 h-10 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M18 10c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zM9 7a1 1 0 012 0v1a1 1 0 11-2 0V7zm1 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                </svg>
                            </div>
                        </div>
                            <div className="text-sm self-center font-semibold text-slate-900">
                                {message ?? "Has your need been resolved?"}
                            </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

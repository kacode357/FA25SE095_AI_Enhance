"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Option<T extends string | number> = { value: T; label: string };

export type SelectProps<T extends string | number> = {
    value: T | "" | undefined;
    options: Option<T>[];
    placeholder?: string;
    onChange: (v: T) => void;
    className?: string;
    disabled?: boolean;
};

export default function Select<T extends string | number>({
    value,
    options,
    placeholder,
    onChange,
    className,
    disabled,
}: SelectProps<T>) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function onDoc(e: MouseEvent) {
            if (!ref.current) return;
            if (!ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, []);

    const selected = options.find((o) => o.value === value);

    return (
        <div ref={ref} className={`relative ${className ?? ""}`}>
            <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open ? "true" : "false"}
                onClick={() => setOpen((s) => !s)}
                disabled={disabled}
                className="w-full text-left rounded-md border border-slate-300 bg-white px-3 py-2 flex items-center justify-between gap-2 shadow-sm hover:shadow-md transition-shadow disabled:opacity-60"
            >
                <span className={`truncate text-sm ${selected ? "text-gray-900" : "text-gray-500"}`}>
                    {selected?.label ?? placeholder ?? "Select..."}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {open && (
                <div className="absolute z-40 left-0 right-0 mt-2 rounded-md bg-white shadow-lg border border-slate-100">
                    <div role="listbox" aria-label={placeholder ?? "Options"} className="max-h-64 overflow-auto">
                        {options.map((opt) => (
                            <button
                                key={String(opt.value)}
                                type="button"
                                role="option"
                                aria-selected={opt.value === value ? "true" : "false"}
                                onClick={() => {
                                    onChange(opt.value);
                                    setOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between gap-2 ${opt.value === value ? "bg-slate-50" : ""}`}
                            >
                                <span className="truncate text-sm text-gray-900">{opt.label}</span>
                                {opt.value === value && <Check className="w-4 h-4 text-emerald-600" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

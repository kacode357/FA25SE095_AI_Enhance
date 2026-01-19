"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type Option<T extends string | number> = { value: T; label: ReactNode };

export type SelectProps<T extends string | number> = {
  value: T | "" | undefined;
  options: Option<T>[];
  placeholder?: string;
  onChange: (v: T) => void;
  className?: string;
  noShadow?: boolean;
  disabled?: boolean;
};

type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export default function Select<T extends string | number>({
  value,
  options,
  placeholder,
  onChange,
  className,
  noShadow = false,
  disabled,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<Rect | null>(null);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const selected = options.find((o) => o.value === value);

  // Cập nhật vị trí dropdown dựa trên button
  const updateRect = () => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setRect({
      top: r.bottom + window.scrollY,
      left: r.left + window.scrollX,
      width: r.width,
      height: r.height,
    });
  };

  // Khi open = true thì đo lại rect
  useLayoutEffect(() => {
    if (open) {
      updateRect();
    }
  }, [open]);

  // Reposition khi scroll / resize
  useEffect(() => {
    if (!open) return;

    const handleScroll = () => updateRect();
    const handleResize = () => updateRect();

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [open]);

  // Click ngoài để đóng (kể cả dropdown render ở portal)
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!open) return;
      const target = e.target as Node | null;
      if (!target) return;

      if (
        wrapperRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const handleOptionClick = (optValue: T, e: ReactMouseEvent) => {
    e.preventDefault();
    onChange(optValue);
    setOpen(false);
  };

  const dropdown =
    open && rect
      ? createPortal(
          <div
            ref={dropdownRef}
            className="cursor-pointer rounded-md bg-white shadow-lg border border-slate-100 z-[9999]"
            style={{
              position: "absolute",
              top: rect.top + 4, // thêm chút margin
              left: rect.left,
              width: rect.width,
            }}
          >
            <div
              role="listbox"
              aria-label={placeholder ?? "Options"}
              className="max-h-64 overflow-auto"
            >
              {options.map((opt) => (
                <button
                  key={String(opt.value)}
                  type="button"
                  role="option"
                  onClick={(e) => handleOptionClick(opt.value, e)}
                  className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between gap-2 ${
                    opt.value === value ? "bg-slate-50" : ""
                  }`}
                >
                  <div className="text-sm text-gray-900 leading-tight whitespace-normal break-words flex-1 pr-2">
                    {opt.label}
                  </div>
                  {opt.value === value && (
                    <Check className="w-4 h-4 text-emerald-600" />
                  )}
                </button>
              ))}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div ref={wrapperRef} className={className ?? ""}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && setOpen((s) => !s)}
        disabled={disabled}
        className={`w-full text-left rounded-md cursor-pointer border border-slate-200 bg-white px-3 py-2 flex items-center justify-between gap-2 ${noShadow ? 'shadow-none hover:shadow-none' : 'shadow-sm hover:shadow-md'} transition-shadow disabled:opacity-60`}
      >
        <div
          className={`flex-1 mr-2 text-left text-sm leading-tight whitespace-normal break-words ${
            selected ? "text-gray-900" : "text-gray-500"
          }`}
        >
          {selected?.label ?? (placeholder ?? "Select...")}
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {dropdown}
    </div>
  );
}

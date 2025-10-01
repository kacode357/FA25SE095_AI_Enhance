// components/ui/input.tsx
"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import React, { useId, useState } from "react";

type BaseProps = HTMLMotionProps<"input"> & {
  label?: string;
  hint?: string;
  error?: string;
  variant?: "default" | "light"; // light = light surface (white bg, dark text)
};

export const Input = React.forwardRef<HTMLInputElement, BaseProps>(
  ({ label, hint, error, className = "", id, name, type, variant = "default", ...props }, ref) => {
    const reactId = useId();
    const inputId = id ?? name ?? reactId;
    const isPassword = type === "password";
    const [visible, setVisible] = useState(false);
    const effectiveType = isPassword && visible ? "text" : type;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={`block text-sm mb-1.5 transition-colors ${variant === "light" ? "text-slate-700" : "text-white/80"}`}
          >
            {label}
          </label>
        )}

        <div className="relative">
          <motion.input
            whileFocus={{ scale: 1.002 }}
            id={inputId}
            name={name} // 👈 BẮT BUỘC để FormData hoạt động
            ref={ref}
            type={effectiveType}
            className={`input ${variant === "light" ? "input-light" : ""} ${isPassword ? "pr-12" : ""} ${className} placeholder-emerald-600`}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              aria-label={visible ? "Hide password" : "Show password"}
              title={visible ? "Hide password" : "Show password"}
              onClick={() => setVisible((v) => !v)}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors
                ${variant === 'light'
                  ? 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50'
                  : 'text-white/70 hover:text-white hover:bg-white/5'}
              `}
              tabIndex={0}
            >
              {visible ? (
                // Eye-off icon
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M3 3l18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 5.09A10.92 10.92 0 0112 5c5 0 9.27 3.11 10.5 7.5-.37 1.28-.98 2.46-1.78 3.5m-3.16 2.41A10.93 10.93 0 0112 19C7 19 2.73 15.89 1.5 11.5c.55-1.89 1.64-3.56 3.06-4.84"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                // Eye icon
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M1.5 12.5C2.73 8.11 7 5 12 5s9.27 3.11 10.5 7.5C21.27 16.89 17 20 12 20S2.73 16.89 1.5 12.5z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="12.5"
                    r="3.5"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              )}
            </button>
          )}
        </div>

        {hint && !error && (
          <div className="mt-1 text-xs text-white/50">{hint}</div>
        )}
        {error && (
          <div className="mt-1 text-xs text-red-400">{error}</div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

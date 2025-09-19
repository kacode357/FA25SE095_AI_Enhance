"use client";

import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export default function Input({ label, hint, error, id, name, type, className = "", ...props }: Props) {
  const inputId = id ?? name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm text-black/70 mb-1.5">
          {label}
        </label>
      )}
      <input id={inputId} type={type} className={`input ${className}`} {...props} />
      {hint && !error && <div className="mt-1 text-xs text-black/50">{hint}</div>}
      {error && <div className="mt-1 text-xs text-red-500">{error}</div>}
    </div>
  );
}

import React from "react";

// Prevent typing non-numeric characters in inputs (used with onKeyDown)
export function allowNumericKey(e: React.KeyboardEvent<HTMLInputElement>) {
  // allow navigation & control keys
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Enter", "."];
  if (allowed.includes(e.key)) return;
  // block scientific notation and signs
  if (e.key === "e" || e.key === "E" || e.key === "-" || e.key === "+") {
    e.preventDefault();
    return;
  }
  // only allow digits
  if (!/^[0-9]$/.test(e.key)) {
    e.preventDefault();
  }
}

// Prevent paste of invalid content (letters, signs, scientific notation)
export function preventInvalidPaste(e: React.ClipboardEvent<HTMLInputElement>) {
  const text = e.clipboardData.getData("text");
  if (!/^\d*\.?\d*$/.test(text)) {
    e.preventDefault();
    return;
  }
  if (text.includes("-") || text.includes("e") || text.includes("E") || text.includes("+")) {
    e.preventDefault();
  }
}

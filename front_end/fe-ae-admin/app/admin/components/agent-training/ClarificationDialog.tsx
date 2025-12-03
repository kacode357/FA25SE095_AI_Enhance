"use client";

import React, { useState } from "react";

interface ClarificationDialogProps {
  question: string;
  confidence: number;
  onResponse: (response: string) => void;
  onCancel: () => void;
}

export const ClarificationDialog: React.FC<ClarificationDialogProps> = ({
  question,
  confidence,
  onResponse,
  onCancel,
}) => {
  const [response, setResponse] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (response.trim()) {
      onResponse(response.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-slate-200 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            Clarification Needed
          </h3>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            Confidence: {(confidence * 100).toFixed(0)}%
          </span>
        </div>

        <p className="mb-3 text-sm text-slate-600">
          The agent needs clarification to better understand your feedback:
        </p>

        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
          {question}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="clarification-response"
              className="mb-1 block text-sm font-medium text-slate-900"
            >
              Your Response
            </label>
            <textarea
              id="clarification-response"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Please clarify your feedback..."
              required
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!response.trim()}
              className="inline-flex items-center rounded-xl bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Submit Clarification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

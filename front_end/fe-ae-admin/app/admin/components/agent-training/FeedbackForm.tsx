"use client";

import React, { useState } from "react";

interface FeedbackFormProps {
  jobId: string;
  onSubmit: (feedback: string) => void;
  disabled?: boolean;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  jobId: _jobId,
  onSubmit,
  disabled = false,
}) => {
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim()) {
      onSubmit(feedback.trim());
      setFeedback("");
    }
  };

  const suggestionExamples = [
    "Great! All products were extracted correctly.",
    "Prices are missing the currency symbol.",
    "Some product descriptions are incomplete.",
    "Perfect extraction, but should also include product ratings.",
    "The pagination didn't work - only got first page.",
  ];

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <h4 className="text-sm font-semibold text-slate-900">
          Provide Feedback (Required)
        </h4>
        <p className="mt-1 text-xs text-slate-600">
          Your feedback helps the agent learn and improve. Please describe what
          went well and what could be improved.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <label
            htmlFor="feedback"
            className="block text-xs font-medium text-slate-900"
          >
            Feedback in Natural Language{" "}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Describe what was good and what needs improvement..."
            required
            disabled={disabled}
            rows={4}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
          />
        </div>

        <div className="space-y-1">
          <p className="text-[11px] font-medium text-slate-700">
            Example feedback:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestionExamples.map((example, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setFeedback(example)}
                disabled={disabled}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] text-slate-800 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!feedback.trim() || disabled}
          className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {disabled ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
};

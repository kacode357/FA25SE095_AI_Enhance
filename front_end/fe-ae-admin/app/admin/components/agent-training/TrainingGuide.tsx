"use client";

import React from "react";
import {
  ClipboardList,
  LineChart,
  MessageSquare,
  Repeat2,
} from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "Define the crawl",
    description:
      "Describe the target page and data fields clearly so the agent understands the goal.",
  },
  {
    icon: LineChart,
    title: "Monitor live logs",
    description:
      "Watch the crawl log console to verify navigation, extraction, and potential blockers.",
  },
  {
    icon: MessageSquare,
    title: "Give precise feedback",
    description:
      "Explain what worked and what failed. Mention missing values, formatting, or accuracy issues.",
  },
  {
    icon: Repeat2,
    title: "Iterate and improve",
    description:
      "Submit another crawl using insights or prior feedback to keep the training loop tight.",
  },
];

interface TrainingGuideProps {
  action?: React.ReactNode;
}

export const TrainingGuide: React.FC<TrainingGuideProps> = ({
  action,
}) => {
  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Training Workflow Guide
          </h2>
          <p className="text-xs text-slate-500">
            Follow these steps to keep the crawl-and-feedback loop efficient.
          </p>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {steps.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-slate-800"
          >
            <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
              <Icon className="h-4 w-4" strokeWidth={2} />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-xs text-slate-600">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrainingGuide;

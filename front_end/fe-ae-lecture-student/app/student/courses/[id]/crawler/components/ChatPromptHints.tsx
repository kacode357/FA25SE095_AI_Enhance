"use client";

import { Lightbulb, BarChart3, PieChart, ListChecks } from "lucide-react";

type Props = {
  onSend: (prompt: string) => void;
  disabled?: boolean;
};

const PROMPTS = [
  {
    icon: <ListChecks className="h-4 w-4 text-[var(--brand)]" />,
    text:
      "List all products with image, name, current price, original price, discount percent, and category.",
  },
  {
    icon: <BarChart3 className="h-4 w-4 text-[var(--brand)]" />,
    text:
      "Create a bar chart comparing current vs original price for each product, sorted by highest discount.",
  },
  {
    icon: <PieChart className="h-4 w-4 text-[var(--brand)]" />,
    text:
      "Build a pie chart showing the share of products by category using the crawled data.",
  },
  {
    icon: <BarChart3 className="h-4 w-4 text-[var(--brand)]" />,
    text:
      "Give me key insights: top 5 best deals, average discount, and show a line chart of price distribution if available.",
  },
];

export default function ChatPromptHints({ onSend, disabled }: Props) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white/80 p-3 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[var(--foreground)]">
        <Lightbulb className="h-4 w-4 text-[var(--brand)]" />
        Suggested prompts (English)
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {PROMPTS.map((item) => (
          <button
            key={item.text}
            type="button"
            onClick={() => onSend(item.text)}
            disabled={disabled}
            className="inline-flex items-start gap-2 rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-left text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {item.icon}
            <span className="leading-snug">{item.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

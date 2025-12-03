// app/.../crawler/components/CrawlerUrlPromptSection.tsx
"use client";

type Props = {
  url: string;
  prompt: string;
  onUrlChange: (value: string) => void;
  onPromptChange: (value: string) => void;
  onStartCrawl: () => void;
  submitting: boolean;
  chatConnected: boolean;
  crawlConnected: boolean;
  assignmentId?: string | null;
  promptUsed?: string;
  activeJobId?: string | null;
};

export default function CrawlerUrlPromptSection({
  url,
  prompt,
  onUrlChange,
  onPromptChange,
  onStartCrawl,
  submitting,
  chatConnected,
  crawlConnected,
  assignmentId,
  promptUsed,
  activeJobId,
}: Props) {
  const disabled =
    submitting || !chatConnected || !crawlConnected || !assignmentId;

  return (
    <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
      <div className="mb-3 text-sm font-medium text-slate-800">
        🎯 URL &amp; Prompt
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            URL to crawl
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://example.com/products"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-0 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            What to extract (prompt)
          </label>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Ví dụ: Lấy toàn bộ thông tin sản phẩm trang này (tên, giá, brand, categories, ...)"
            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-0 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <button
          type="button"
          onClick={onStartCrawl}
          disabled={disabled}
          className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-600 hover:to-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "🔄 Creating crawl job..." : "🚀 Start Smart Crawl"}
        </button>

        {promptUsed && (
          <p className="text-[11px] text-slate-400">
            Last prompt used:{" "}
            <span className="font-medium text-slate-600">{promptUsed}</span>
          </p>
        )}

        {activeJobId && (
          <p className="text-[11px] text-indigo-600">
            Active job: <code>{activeJobId}</code>
          </p>
        )}
      </div>
    </div>
  );
}

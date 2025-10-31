// app/student/crawler/results/[jobId]/page.tsx
"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSmartCrawlJobResults } from "@/hooks/smart-crawler/useSmartCrawlJobResults";
import type { SmartCrawlJobResultItem } from "@/types/smart-crawler/smart-crawler.response";

const dt = (s?: string) => {
  if (!s) return "";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleString("en-GB");
};

function pickTitle(r: SmartCrawlJobResultItem) {
  const t =
    r.title ??
    (r.extractedData?.product_title as string) ??
    (r.extractedData?.product_name as string) ??
    (r.extractedData?.name as string) ??
    "";
  return typeof t === "string" ? t.trim() : "";
}

function pickPrice(r: SmartCrawlJobResultItem) {
  const p =
    (r.extractedData?.current_price as string) ??
    (r.extractedData?.price as string) ??
    "";
  return typeof p === "string" ? p.trim() : "";
}

function pickImage(r: SmartCrawlJobResultItem) {
  const x = r.extractedData ?? {};
  const candidate =
    (x as any).product_image_url ??
    (x as any).image_url ??
    (x as any).product_image ??
    (x as any).image ??
    (x as any).thumbnail ??
    (x as any).img ??
    (x as any).photo_url ??
    (x as any).picture ??
    "";
  return typeof candidate === "string" ? candidate.trim() : "";
}

/** Thumbnail có fallback khi lỗi ảnh */
function Thumb({ src, alt }: { src: string; alt: string }) {
  const [ok, setOk] = useState(!!src);
  const showFallback = !ok || !src;

  return (
    <div className="w-16 h-16 rounded-md bg-[var(--soft)] overflow-hidden shrink-0 flex items-center justify-center">
      {showFallback ? (
        <span className="text-[10px] text-[var(--text-muted)]">no image</span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setOk(false)}
        />
      )}
    </div>
  );
}

export default function CrawlResultsPage() {
  const params = useParams();
  const jobId =
    typeof params?.jobId === "string"
      ? params.jobId
      : Array.isArray(params?.jobId)
      ? params.jobId[0]
      : "";

  // ==== Infinite scroll states ====
  const [items, setItems] = useState<SmartCrawlJobResultItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [hasMore, setHasMore] = useState(true);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const { loading, fetchResults, reset } = useSmartCrawlJobResults();

  const loadPage = useCallback(
    async (p: number, ps = pageSize) => {
      if (!jobId) return;
      const res = await fetchResults(jobId, { page: p, pageSize: ps });
      if (p === 1) setItems(res);
      else setItems((prev) => [...prev, ...res]);

      if (!Array.isArray(res) || res.length < ps) {
        setHasMore(false); // hết dữ liệu
      }
    },
    [fetchResults, jobId, pageSize]
  );

  // Load đầu trang hoặc khi đổi jobId/pageSize
  useEffect(() => {
    if (!jobId) return;
    setItems([]);
    setPage(1);
    setHasMore(true);
    loadPage(1, pageSize);
    return () => reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, pageSize]);

  // IntersectionObserver: tự load thêm khi gần chạm đáy
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loading) {
          const next = page + 1;
          setPage(next);
          loadPage(next);
        }
      },
      {
        root: null,
        rootMargin: "600px 0px", // chạm cách đáy 600px sẽ trigger sớm
        threshold: 0,
      }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loading, page, loadPage]);

  if (!jobId) {
    return (
      <div className="p-6">
        <div className="text-sm text-[var(--text-muted)]">Invalid job id.</div>
        <div className="mt-2">
          <Link href="/student/crawler?tab=history" className="underline">
            Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Crawl Results</h1>
        <div className="flex items-center gap-2">
          <label className="text-xs text-[var(--text-muted)]">Page size</label>
          <select
            className="border border-[var(--border)] rounded-md p-1 text-xs bg-white"
            value={pageSize}
            onChange={(e) => {
              const ps = Number(e.target.value);
              setPageSize(ps);
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>

          <Link
            href="/student/crawler?tab=history"
            className="btn px-3 py-1.5 rounded-md border bg-white border-[var(--border)] text-nav hover:text-nav-active"
          >
            Back to History
          </Link>
        </div>
      </div>

      {/* Body */}
      <div className="card rounded-2xl p-4">
        {/* Loading lần đầu */}
        {loading && items.length === 0 && (
          <div className="py-10 flex items-center gap-2 justify-center text-[var(--text-muted)]">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading…
          </div>
        )}

        {/* Empty */}
        {!loading && items.length === 0 && (
          <div className="py-10 text-center text-sm text-[var(--text-muted)]">No results.</div>
        )}

        {/* LIST TỪNG DÒNG */}
        {items.length > 0 && (
          <>
            <ul className="divide-y divide-[var(--border)]">
              {items.map((r) => {
                const title = pickTitle(r);
                const price = pickPrice(r);
                const img = pickImage(r);
                return (
                  <li key={r.id} className="py-3 flex items-start gap-3">
                    {/* thumbnail */}
                    <Thumb src={img} alt={title || r.url} />

                    {/* content */}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium break-words">{title || "(no title)"}</div>
                      <div className="text-[12px] text-[var(--text-muted)] mt-0.5 flex flex-wrap items-center gap-2">
                        <span>{price || "—"}</span>
                        <span>•</span>
                        <span>{dt(r.crawledAt)}</span>
                      </div>
                      <div className="mt-1 text-[12px] break-words">
                        <a href={r.url} target="_blank" rel="noreferrer" className="underline">
                          Open source URL
                        </a>
                      </div>

                      {(!title || !price) && (
                        <details className="mt-2">
                          <summary className="text-xs cursor-pointer text-[var(--text-muted)]">
                            Show raw extractedData
                          </summary>
                          <pre className="mt-1 text-[11px] whitespace-pre-wrap break-words bg-[var(--soft)] rounded p-2">
                            {JSON.stringify(r.extractedData, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Sentinel để auto load */}
            <div ref={sentinelRef} />

            {/* Loading thêm trang */}
            {loading && items.length > 0 && (
              <div className="py-4 flex items-center gap-2 justify-center text-[var(--text-muted)] text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading more…
              </div>
            )}

            {/* Hết dữ liệu */}
            {!hasMore && !loading && (
              <div className="py-4 text-center text-[12px] text-[var(--text-muted)]">— End —</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

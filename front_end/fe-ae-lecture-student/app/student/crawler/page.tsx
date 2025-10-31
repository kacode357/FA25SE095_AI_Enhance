// app/student/crawler/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

import { useStartCrawler } from "@/hooks/crawler/useStartCrawler";
import { CrawlerType, Priority } from "@/config/crawl-services/crawler.enums";
import type { StartCrawlerPayload } from "@/types/crawler/crawler.payload";
import { useAuth } from "@/contexts/AuthContext";

import {
  ArrowLeft,
  Rocket,
  Link2,
  Settings2,
  ActivitySquare,
  Loader2,
  CheckCircle2,
  BookOpen,
  ChevronDown,
  Check,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

/* -------- helpers -------- */
const decodeB64 = (s: string) => {
  try {
    return decodeURIComponent(atob(s));
  } catch {
    return "";
  }
};

type PresetEnvelope = {
  payload: StartCrawlerPayload;
  meta?: { courseId?: string; courseName?: string; assignmentTitle?: string };
};

const CRAWLER_TYPE_LABEL: Record<number, string> = {
  [CrawlerType.HttpClient]: "HttpClient",
  [CrawlerType.Selenium]: "Selenium",
  [CrawlerType.Playwright]: "Playwright",
  [CrawlerType.Scrapy]: "Scrapy",
  [CrawlerType.Universal]: "Universal",
  [CrawlerType.AppSpecificApi]: "AppSpecificApi",
  [CrawlerType.MobileMcp]: "MobileMcp",
  [CrawlerType.Crawl4AI]: "Crawl4AI",
};

const PRIORITY_LABEL: Record<number, string> = {
  [Priority.Low]: "Low",
  [Priority.Normal]: "Normal",
  [Priority.High]: "High",
  [Priority.Critical]: "Critical",
};

export default function CrawlerStartPage() {
  const qs = useSearchParams();
  const presetB64 = qs.get("preset") ?? "";

  // Auth → user id
  const { user } = useAuth();
  const userId = user?.id ?? "";

  // ---- Decode preset (NO API calls here) ----
  const [assignmentId, setAssignmentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [courseName, setCourseName] = useState("");
  const [assignmentTitle, setAssignmentTitle] = useState("");

  // form state
  const [urlsText, setUrlsText] = useState("");
  const [crawlerType, setCrawlerType] = useState<CrawlerType>(CrawlerType.HttpClient);
  const [priority, setPriority] = useState<Priority>(Priority.Low);
  const [timeoutSeconds, setTimeoutSeconds] = useState<number>(15);
  const [followRedirects, setFollowRedirects] = useState(true);
  const [extractImages, setExtractImages] = useState(true);
  const [extractLinks, setExtractLinks] = useState(true);
  const [customConfigJson, setCustomConfigJson] = useState("");

  useEffect(() => {
    if (!presetB64) return;
    const json = decodeB64(presetB64);
    if (!json) return;

    try {
      const preset: PresetEnvelope = JSON.parse(json);
      const p = preset.payload;

      setAssignmentId(p.assignmentId ?? "");
      if (Array.isArray(p.urls) && p.urls.length) setUrlsText(p.urls.join("\n"));
      if (typeof p.crawlerType === "number") setCrawlerType(p.crawlerType as CrawlerType);
      if (typeof p.priority === "number") setPriority(p.priority as Priority);

      setTimeoutSeconds(p.configuration?.timeoutSeconds ?? 15);
      setFollowRedirects(p.configuration?.followRedirects ?? true);
      setExtractImages(p.configuration?.extractImages ?? true);
      setExtractLinks(p.configuration?.extractLinks ?? true);
      setCustomConfigJson(p.configuration?.customConfigJson ?? "");

      setCourseId(preset.meta?.courseId ?? "");
      setCourseName(preset.meta?.courseName ?? "");
      setAssignmentTitle(preset.meta?.assignmentTitle ?? "");
    } catch {
      // ignore malformed preset
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetB64]);

  const urls = useMemo(
    () => urlsText.split(/\r?\n/).map((s) => s.trim()).filter(Boolean),
    [urlsText]
  );

  const { loading, data, start, reset } = useStartCrawler();
  const canStart = useMemo(() => Boolean(userId) && urls.length > 0 && !loading, [userId, urls.length, loading]);

  const onStart = async () => {
    const payload: StartCrawlerPayload = {
      userId,
      urls,
      crawlerType,
      priority,
      assignmentId: assignmentId || undefined,
      configuration: {
        timeoutSeconds,
        followRedirects,
        extractImages,
        extractLinks,
        customConfigJson: customConfigJson || undefined,
      },
      userTier: 0,
    };
    await start(payload); // interceptors handle errors/toasts
  };

  const backHref =
    courseId && assignmentId
      ? `/student/courses/${courseId}/assignments/${assignmentId}`
      : "/student";

  const headerSubtitle =
    courseName
      ? `Course: ${courseName}${assignmentTitle ? ` • Assignment: ${assignmentTitle}` : ""}`
      : assignmentTitle
        ? `Assignment: ${assignmentTitle}`
        : "";

  return (
    <motion.div
      className="flex flex-col gap-6 py-6 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-nav flex items-center gap-2 truncate">
            <Rocket className="w-7 h-7 text-nav-active" />
            <span className="truncate">AI Crawler</span>
          </h1>
          {headerSubtitle && (
            <div className="mt-1 text-sm text-[var(--text-muted)] flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="truncate">{headerSubtitle}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={backHref}
            className="btn bg-white border border-brand text-nav hover:text-nav-active"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* LEFT: Input form */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* URLs */}
          <div className="card rounded-2xl p-4">
            <div className="mb-2 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-nav-active" />
              <h2 className="text-lg font-bold text-nav">Target URLs</h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-3">
              One URL per line. The crawler will not start automatically; it only runs when you click <b>Start crawl</b>.
            </p>
            <textarea
              className="input !rounded-lg"
              rows={8}
              placeholder={"https://example.com\nhttps://openai.com/…"}
              value={urlsText}
              onChange={(e) => setUrlsText(e.target.value)}
            />
            <div className="mt-2 text-xs text-[var(--text-muted)]">
              <b>{urls.length}</b> URL(s).
            </div>
          </div>

          {/* Options */}
          <div className="card rounded-2xl p-4">
            <div className="mb-2 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-nav-active" />
              <h2 className="text-lg font-bold text-nav">Options</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {/* Crawler Type (Dropdown) */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-[var(--text-muted)]">Crawler Type</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="btn bg-white border border-brand text-nav hover:text-nav-active justify-between">
                      <span>{CRAWLER_TYPE_LABEL[crawlerType]}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="min-w-48">
                    <DropdownMenuLabel>Select type</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                      value={String(crawlerType)}
                      onValueChange={(v) => setCrawlerType(Number(v) as CrawlerType)}
                    >
                      {Object.entries(CRAWLER_TYPE_LABEL).map(([val, label]) => (
                        <DropdownMenuRadioItem key={val} value={val}>
                          {label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Priority (Dropdown) */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-[var(--text-muted)]">Priority</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="btn bg-white border border-brand text-nav hover:text-nav-active justify-between">
                      <span>{PRIORITY_LABEL[priority]}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="min-w-40">
                    <DropdownMenuLabel>Select priority</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                      value={String(priority)}
                      onValueChange={(v) => setPriority(Number(v) as Priority)}
                    >
                      {Object.entries(PRIORITY_LABEL).map(([val, label]) => (
                        <DropdownMenuRadioItem key={val} value={val}>
                          {label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Timeout */}
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Timeout (seconds)</label>
                <input
                  type="number"
                  min={0}
                  className="input !p-2"
                  value={timeoutSeconds}
                  onChange={(e) => setTimeoutSeconds(Number(e.target.value || 0))}
                />
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-2 gap-2 items-start">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={followRedirects} onChange={(e) => setFollowRedirects(e.target.checked)} />
                  <span>Follow redirects</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={extractImages} onChange={(e) => setExtractImages(e.target.checked)} />
                  <span>Extract images</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={extractLinks} onChange={(e) => setExtractLinks(e.target.checked)} />
                  <span>Extract links</span>
                </label>
              </div>

              {/* Custom JSON */}
              <div className="sm:col-span-2">
                <label className="block text-xs text-[var(--text-muted)] mb-1">Custom Config (JSON string)</label>
                <textarea
                  className="input !rounded-lg"
                  rows={4}
                  placeholder='{"ua": "AIDS-LMS/1.0"}'
                  value={customConfigJson}
                  onChange={(e) => setCustomConfigJson(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Actions & result */}
        <div className="lg:col-span-3 flex flex-col gap-4 lg:sticky lg:top-24">
          <div className="card rounded-2xl p-4">
            <div className="mb-2">
              <h3 className="text-base font-bold text-nav">Action</h3>
            </div>

            <button
              className="btn btn-gradient-slow w-full disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={onStart}
              disabled={!canStart}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Starting…</span>
                </>
              ) : (
                <>
                  <ActivitySquare className="w-4 h-4" />
                  <span>Start crawl</span>
                </>
              )}
            </button>

            {!userId && (
              <p className="mt-2 text-xs text-red-600">
                Missing <b>userId</b>. Please ensure you are logged in.
              </p>
            )}
            {urls.length === 0 && (
              <p className="mt-2 text-xs text-[var(--text-muted)]">Enter at least one URL to start.</p>
            )}
          </div>

          {data && (
            <div className="card rounded-2xl p-4 border border-emerald-200 bg-emerald-50">
              <div className="mb-2 flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                <h3 className="text-base font-bold">Job started</h3>
              </div>
              <div className="text-sm text-emerald-800 space-y-1">
                <div><b>Job ID:</b> {data.jobId}</div>
                <div><b>Status:</b> {data.status}</div>
                <div className="text-xs opacity-80">
                  <b>Created:</b> {new Date(data.createdAt).toLocaleString("en-GB")}
                </div>
                {data.message && (
                  <div className="text-xs opacity-80">
                    <b>Message:</b> {data.message}
                  </div>
                )}
              </div>

              <div className="mt-3 flex gap-2">
                <button className="btn bg-white border border-brand text-nav hover:text-nav-active" onClick={reset}>
                  Reset
                </button>
                <Link href={backHref} className="btn btn-gradient">
                  Back to assignment
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

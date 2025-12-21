"use client";

import { useState } from "react";
import { Database, Link as LinkIcon } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SmartCrawlJobResultItem } from "@/types/smart-crawler/smart-crawler.response";
import type { JobHistoryEntry } from "../crawler-types";
import CrawlerResultsSection from "./CrawlerResultsSection";
import CrawlerConversationFilesSection from "./CrawlerConversationFilesSection";

type Props = {
  conversationId: string | null;
  results: SmartCrawlJobResultItem[];
  resultsLoading: boolean;
  historyIndex?: number;
  currentSummary?: string;
  currentPrompt?: string;
  jobHistory?: JobHistoryEntry[];
  onSelectHistoryIndex?: (index: number) => void;
};

export default function CrawlerResultsTabs({
  conversationId,
  results,
  resultsLoading,
  historyIndex,
  currentSummary,
  currentPrompt,
  jobHistory,
  onSelectHistoryIndex,
}: Props) {
  const [activeTab, setActiveTab] = useState("data");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
      <TabsList className="border border-[var(--border)] bg-white">
        <TabsTrigger value="data" className="text-[11px] font-semibold">
          <Database className="h-3.5 w-3.5 text-[var(--brand)]" />
          Crawled Data
        </TabsTrigger>
        <TabsTrigger value="files" className="text-[11px] font-semibold">
          <LinkIcon className="h-3.5 w-3.5 text-[var(--brand)]" />
          Uploaded Files
        </TabsTrigger>
      </TabsList>

      <TabsContent value="data">
        <CrawlerResultsSection
          results={results}
          resultsLoading={resultsLoading}
          historyIndex={historyIndex}
          currentSummary={currentSummary}
          currentPrompt={currentPrompt}
          jobHistory={jobHistory}
          onSelectHistoryIndex={onSelectHistoryIndex}
        />
      </TabsContent>

      <TabsContent value="files">
        <CrawlerConversationFilesSection
          conversationId={conversationId}
          active={activeTab === "files"}
        />
      </TabsContent>
    </Tabs>
  );
}

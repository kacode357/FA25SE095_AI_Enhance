// hooks/smart-crawler/useSmartCrawlerJobResults.ts
"use client";

import { useState } from "react";
import { SmartCrawlerService } from "@/services/smart-crawler.services";
import type { SmartCrawlJobResultsQuery } from "@/types/smart-crawler/smart-crawler.payload";
import type { SmartCrawlJobResultItem } from "@/types/smart-crawler/smart-crawler.response";

export function useSmartCrawlerJobResults() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SmartCrawlJobResultItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 50;

  const totalPages = Math.ceil(totalCount / pageSize);

  const clearResults = () => {
    setResults([]);
    setCurrentPage(1);
    setTotalCount(0);
  };

  const fetchJobResults = async (
    jobId: string,
    page: number = 1
  ): Promise<SmartCrawlJobResultItem[] | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      console.log("[CrawlerResults] Fetching job results - jobId:", jobId, "page:", page, "pageSize:", pageSize);
      
      // Fetch job info để lấy tổng số results
      const jobInfo = await SmartCrawlerService.getJob(jobId);
      const total = jobInfo?.resultCount || 0;
      setTotalCount(total);
      console.log("[CrawlerResults] Total result count:", total);
      
      // Fetch results cho page hiện tại
      const res = await SmartCrawlerService.getJobResults(jobId, { page, pageSize });
      console.log("[CrawlerResults] Fetched", res?.length || 0, "results for page", page);
      
      setResults(res);
      setCurrentPage(page);
      return res;
    } catch (error) {
      console.error("[CrawlerResults] Error fetching results:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const goToPage = async (jobId: string, page: number) => {
    if (page < 1 || page > totalPages || loading) return;
    await fetchJobResults(jobId, page);
  };

  const nextPage = async (jobId: string) => {
    if (currentPage < totalPages) {
      await goToPage(jobId, currentPage + 1);
    }
  };

  const prevPage = async (jobId: string) => {
    if (currentPage > 1) {
      await goToPage(jobId, currentPage - 1);
    }
  };

  return {
    fetchJobResults,
    goToPage,
    nextPage,
    prevPage,
    loading,
    results,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    clearResults,
  };
}


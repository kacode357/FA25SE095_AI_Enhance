// hooks/smart-crawler/useSmartCrawlerJobResults.ts
"use client";

import { useState } from "react";
import { SmartCrawlerService } from "@/services/smart-crawler.services";
import type { SmartCrawlJobResultsQuery } from "@/types/smart-crawler/smart-crawler.payload";
import type { SmartCrawlJobResultItem } from "@/types/smart-crawler/smart-crawler.response";

export function useSmartCrawlerJobResults() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SmartCrawlJobResultItem[]>([]);

  const clearResults = () => {
    setResults([]);
  };

  const fetchJobResults = async (
    jobId: string,
    args?: SmartCrawlJobResultsQuery
  ): Promise<SmartCrawlJobResultItem[] | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      console.log("[CrawlerResults] Fetching job results for jobId:", jobId, "with args:", args);
      const res = await SmartCrawlerService.getJobResults(jobId, args);
      console.log("[CrawlerResults] Fetched", res?.length || 0, "results");
      setResults(res);
      return res;
    } catch (error) {
      console.error("[CrawlerResults] Error fetching results:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch ALL results with automatic pagination
   * Sử dụng pageSize lớn (200) để giảm số lần gọi API
   */
  const fetchAllJobResults = async (jobId: string): Promise<SmartCrawlJobResultItem[] | null> => {
    if (loading) return null;
    setLoading(true);
    try {
      console.log("[CrawlerResults] Fetching ALL job results for jobId:", jobId);
      
      // Lấy trang đầu với pageSize lớn
      const pageSize = 200;
      const firstPage = await SmartCrawlerService.getJobResults(jobId, { page: 1, pageSize });
      
      console.log("[CrawlerResults] First page fetched:", firstPage?.length || 0, "results");
      
      // Nếu kết quả < pageSize, tức là đã lấy hết
      if (!firstPage || firstPage.length < pageSize) {
        console.log("[CrawlerResults] All results fetched in first page:", firstPage?.length || 0);
        setResults(firstPage || []);
        return firstPage || [];
      }
      
      // Nếu có nhiều hơn, tiếp tục lấy các trang sau
      const allResults = [...firstPage];
      let currentPage = 2;
      
      while (true) {
        console.log("[CrawlerResults] Fetching page", currentPage);
        const nextPage = await SmartCrawlerService.getJobResults(jobId, { page: currentPage, pageSize });
        
        if (!nextPage || nextPage.length === 0) {
          break;
        }
        
        allResults.push(...nextPage);
        console.log("[CrawlerResults] Page", currentPage, "fetched:", nextPage.length, "results. Total:", allResults.length);
        
        if (nextPage.length < pageSize) {
          break;
        }
        
        currentPage++;
      }
      
      console.log("[CrawlerResults] ALL results fetched:", allResults.length, "total");
      setResults(allResults);
      return allResults;
    } catch (error) {
      console.error("[CrawlerResults] Error fetching all results:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchJobResults,
    fetchAllJobResults,
    loading,
    results,
    clearResults,
  };
}

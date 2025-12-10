"use client";

import PaginationBar from "@/components/common/pagination-all";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetTopics } from "@/hooks/topic/useGetTopics";
import { formatToVN } from "@/utils/datetime/time";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function TopicsPage() {
  const router = useRouter();
  const { data, loading, fetchTopics } = useGetTopics();

  const [topics, setTopics] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchAll = async (pageNum = 1) => {
    await fetchTopics({ page: pageNum, pageSize, sortBy: "createdAt", sortDirection: "desc" });
    setPage(pageNum);
  };

  useEffect(() => {
    fetchAll(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (data?.topics) setTopics(data.topics);
  }, [data]);

  const totalPages = data?.totalPages ?? Math.max(1, Math.ceil((data?.totalCount ?? 0) / pageSize));

  const filtered = useMemo(() => topics, [topics]);

  return (
    <div className="min-h-full flex flex-col p-2 bg-white text-slate-900">
      <header className="sticky top-0 z-20 flex flex-col gap-3 mb-4 bg-white/90 p-2 rounded-md border border-slate-200">
        <div className="flex items-center justify-between">
          <p className="text-slate-600 text-sm relative pl-3 before:content-['•'] before:absolute before:left-0">
            Create and manage course topics used for categorizing courses.
          </p>
          <Button className="h-9 bg-emerald-600 btn btn-green-slow hover:bg-emerald-700 text-white flex items-center gap-2" onClick={() => router.push('/staff/courses/topics/create')}>
            <Plus className="size-4" />Create Topic
          </Button>
        </div>
      </header>

      <Card className="bg-white border border-slate-200 flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="text-base text-slate-800">
            Topics <span className="text-slate-500">({data?.totalCount ?? 0})</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="px-0 flex-1 overflow-hidden">
          <div className="h-full overflow-auto">
            <Table className="table-auto w-full">
              <TableHeader className="sticky top-0 z-10 bg-slate-50">
                <TableRow className="text-slate-600 border-b border-t border-slate-200">
                  <TableHead className="text-left font-bold pl-5">Name</TableHead>
                  <TableHead className="text-left font-bold">Description</TableHead>
                  <TableHead className="text-center font-bold">Active</TableHead>
                  <TableHead className="text-center font-bold">Created At</TableHead>
                  <TableHead className="text-center font-bold">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.map((t) => (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <TableCell className="text-xs text-left pl-5">{t.name}</TableCell>
                    <TableCell className="text-xs text-left">
                      <span className="block max-w-[420px] truncate whitespace-nowrap align-middle" title={t.description}>
                        {t.description}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">{t.isActive ? 'Yes' : 'No'}</TableCell>
                    <TableCell className="text-center text-xs whitespace-nowrap">{formatToVN(t.createdAt, { year: "numeric", month: "2-digit", day: "2-digit" })}</TableCell>
                    <TableCell className="text-center">
                      <Button className="h-8 px-3 btn btn-green-slow text-xs" variant="outline" onClick={() => router.push(`/staff/courses/topics/${t.id}`)}>
                        View
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-500">No topics found.</td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-500">Loading...</td>
                  </tr>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <PaginationBar
          page={page}
          totalPages={totalPages}
          totalCount={data?.totalCount ?? 0}
          loading={loading}
          onPageChange={(p) => {
            if (p !== page) fetchAll(p);
          }}
        />
      </Card>
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Plus, Pencil, Power } from "lucide-react";
import { motion } from "framer-motion";

import { useTerms } from "@/hooks/term/useTerms";
import { useUpdateTerm } from "@/hooks/term/useUpdateTerm";
import { Term } from "@/types/terms/terms.response";

import CreateDialog from "./components/CreateDialog";
import EditDialog from "./components/EditDialog";
import FilterRow from "./components/FilterRow";
import PaginationBar from "@/components/common/PaginationBar";

export default function TermsPage() {
  const { listData, totalPages, totalCount, page, pageSize, loading, fetchTerms } = useTerms();
  const { updateTerm, loading: updating } = useUpdateTerm();

  const [openCreate, setOpenCreate] = useState(false);
  const [openEditId, setOpenEditId] = useState<string | null>(null);
  const [filterActive, setFilterActive] = useState("");
  const [terms, setTerms] = useState<Term[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // 🔹 Fetch all terms with filters & pagination
  const fetchAll = async (pageNum = 1) => {
    await fetchTerms({
      activeOnly: filterActive === "" ? undefined : filterActive === "true",
      page: pageNum,
      pageSize:10,
      sortBy: "CreatedAt",
      sortDirection: "desc",
    });
  };

  useEffect(() => {
    fetchAll(currentPage);
  }, [currentPage, filterActive]);

  useEffect(() => {
    setTerms(listData);
  }, [listData]);

  const filtered = useMemo(() => terms, [terms]);

  // Toggle Active
  const handleToggleActive = async (term: Term) => {
    await updateTerm(term.id, {
      name: term.name,
      description: term.description,
      isActive: !term.isActive,
    });
    await fetchAll(currentPage);
  };

  return (
    <div className="min-h-full flex flex-col p-2 bg-white text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-20 flex flex-col gap-3 mb-4 bg-white/90 p-2 rounded-md border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-slate-600 text-sm relative pl-3 before:content-['•'] before:absolute before:left-0">
            Manage academic terms and their active state.
          </p>
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger asChild>
              <Button className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1">
                <Plus className="size-4" />
                Create Term
              </Button>
            </DialogTrigger>
            <CreateDialog
              title="Create New Term"
              onSubmit={async () => {
                await fetchAll();
                setOpenCreate(false);
              }}
              onCancel={() => setOpenCreate(false)}
            />
          </Dialog>
        </div>
      </header>

      {/* Table */}
      <Card className="bg-white border border-slate-200 flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="text-base text-slate-800">
            Term List <span className="text-slate-500">({totalCount})</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="px-0 flex-1 overflow-hidden">
          <div className="h-full overflow-auto">
            <Table className="table-auto w-full">
              <TableHeader className="sticky top-0 z-10 bg-slate-50">
                <TableRow className="text-slate-600 border-b border-t border-slate-200">
                  <TableHead className="w-56 text-left font-bold pl-5">Name</TableHead>
                  <TableHead className="text-left font-bold">Description</TableHead>
                  <TableHead className="w-28 text-center font-bold">Active</TableHead>
                  <TableHead className="w-36 text-center font-bold">Created At</TableHead>
                  <TableHead className="w-36 text-center font-bold">Actions</TableHead>
                </TableRow>

                <FilterRow
                  filterActive={filterActive}
                  setFilterActive={setFilterActive}
                  fetchAll={() => fetchAll(currentPage)}
                  clearAll={() => {
                    setFilterActive("");
                    fetchAll(1);
                  }}
                />
              </TableHeader>

              <TableBody>
                {filtered.map((t) => (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-b border-slate-100 hover:bg-emerald-50/50"
                  >
                    <TableCell className="text-left pl-5">{t.name}</TableCell>
                    <TableCell className="text-left">{t.description}</TableCell>
                    <TableCell className="text-center">
                      {t.isActive ? (
                        <span className="text-emerald-600 font-semibold">Active</span>
                      ) : (
                        <span className="text-slate-500">Inactive</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-xs whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleDateString("en-GB")}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Edit */}
                        <Dialog open={openEditId === t.id} onOpenChange={(o) => setOpenEditId(o ? t.id : null)}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 px-2 text-emerald-600 hover:bg-emerald-50"
                            >
                              <Pencil className="size-4" />
                            </Button>
                          </DialogTrigger>
                          {openEditId === t.id && (
                            <EditDialog
                              termId={t.id}
                              title="Edit Term"
                              onSubmit={async () => {
                                await fetchAll(currentPage);
                                setOpenEditId(null);
                              }}
                              onCancel={() => setOpenEditId(null)}
                            />
                          )}
                        </Dialog>

                        {/* Toggle Active */}
                        <Button
                          variant="ghost"
                          className={`h-8 px-2 ${t.isActive ? "text-slate-500 hover:bg-slate-100" : "text-emerald-600 hover:bg-emerald-50"}`}
                          onClick={() => handleToggleActive(t)}
                          disabled={updating}
                          title={t.isActive ? "Deactivate Term" : "Activate Term"}
                        >
                          <Power className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-500">
                      No terms found.
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-500">
                      Loading...
                    </td>
                  </tr>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {/* ✅ Pagination */}
        <PaginationBar
          page={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          loading={loading}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </Card>
    </div>
  );
}

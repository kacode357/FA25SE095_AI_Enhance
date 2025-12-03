"use client";

import PaginationBar from "@/components/common/pagination-all";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { usePendingApprovalUsers } from "@/hooks/approve-lecturer/usePendingApprovalUsers";
import type {
    PendingApprovalParams,
} from "@/types/approve-lecturer/approve-lecturer.payload";
import { formatToVN } from "@/utils/datetime/time";
import { getUserStatusClass, getUserStatusLabel } from "@/utils/user-status-color";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function ApproveLecturerPage() {
    const { data, loading, fetchPendingUsers } = usePendingApprovalUsers();

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const load = useCallback(
        async (p = page, ps = pageSize) => {
            const params: PendingApprovalParams = { page: p, pageSize: ps };
            try {
                await fetchPendingUsers(params);
            } catch (e) {
                // ignore: hook handles errors internally if any
                // eslint-disable-next-line no-console
                console.error("Failed to load pending users", e);
            }
        },
        [fetchPendingUsers, page, pageSize]
    );

    useEffect(() => {
        void load(page, pageSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize]);

    const total = data?.totalCount ?? 0;
    const totalPages = data?.totalPages ?? 1;
    const router = useRouter();

    return (
        <div className="p-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-lg font-semibold">Approve Lecturers</h1>
                    <p className="text-xs text-gray-500">Pending approval Lecturers</p>
                </div>
                <div className="text-sm text-gray-500">{total} pending</div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white">
                <Table className="">
                    <TableHeader>
                        <TableRow className="text-xs align-middle">
                            <TableHead className="w-[5%] text-center">NO</TableHead>
                                <TableHead className="w-[40%]">Lecturer</TableHead>
                            <TableHead className="w-[10%] text-center">Role</TableHead>
                            <TableHead className="w-[10%] text-center">Status</TableHead>
                            <TableHead className="w-[15%] text-center">Created At</TableHead>
                            <TableHead className="w-[10%] text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {(!data?.users || data.users.length === 0) ? (
                            <TableRow>
                                <TableCell colSpan={8}>
                                    <div className="py-5 text-center italic text-sm text-gray-400">No pending lecturers.</div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.users.map((u, index) => {
                                const no = (page - 1) * pageSize + index + 1;
                                return (
                                    <TableRow key={u.id} className="align-middle">
                                        <TableCell>
                                            <div className="text-sm text-center font-medium text-gray-700">{no}</div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                <div className="flex-shrink-0">
                                                    <Avatar className="size-12">
                                                        {u.profilePictureUrl ? (
                                                            <AvatarImage src={u.profilePictureUrl ?? undefined} alt={`${u.firstName} ${u.lastName}`} />
                                                        ) : (
                                                            <AvatarFallback className="bg-violet-50 text-violet-700 text-sm font-semibold">{`${(u.firstName?.trim()?.[0] ?? "").toUpperCase()}${(u.lastName?.trim()?.[0] ?? "").toUpperCase()}`}</AvatarFallback>
                                                        )}
                                                    </Avatar>
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-medium text-gray-900 truncate">{u.firstName} {u.lastName}</div>
                                                    <div className="text-[12px] text-gray-500 truncate">{u.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="text-sm text-center text-gray-800">{u.role}</div>
                                        </TableCell>

                                        <TableCell className="text-center">
                                            <div className={`inline-flex items-center text-center justify-center px-2 py-1 rounded-full text-xs font-medium ${getUserStatusClass(u.status)}`}>
                                                {getUserStatusLabel(u.status)}
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="text-sm text-center text-gray-800">
                                                {u.createdAt ? formatToVN(u.createdAt) : "—"}
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button size="sm" variant="outline" className="text-xs btn btn-green-slow" onClick={() => router.push(`/staff/approve-lecturer/${u.id}`)}>
                                                    View
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>

                </Table>
                </div>

                {/* Pagination */}
                <div className="mt-4">
                    <PaginationBar
                        page={page}
                        totalPages={totalPages}
                        totalCount={total}
                        loading={loading}
                        onPageChange={(p) => setPage(p)}
                    />
                </div>
            </div>
        </div>
    );
}

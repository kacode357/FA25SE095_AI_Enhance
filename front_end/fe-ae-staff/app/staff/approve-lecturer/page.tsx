"use client";

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
import { getUserStatusClass, getUserStatusLabel } from "@/utils/user-status-color";
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

    return (
        <div className="p-4">
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
                        <TableRow className="text-xs">
                            <TableHead className="w-[5%] text-center">NO</TableHead>
                            <TableHead className="w-[18%]">Avatar</TableHead>
                            <TableHead className="w-[18%]">Name</TableHead>
                            <TableHead className="w-[20%]">Email</TableHead>
                            <TableHead className="w-[12%] text-center">Role</TableHead>
                            <TableHead className="w-[12%] text-center">Subscription Tier</TableHead>
                            <TableHead className="w-[12%] text-center">Institution Name</TableHead>
                            <TableHead className="w-[12%] text-center">Crawl Quota</TableHead>
                            <TableHead className="w-[12%] text-center">Status</TableHead>
                            <TableHead className="w-[15%] text-center">Created At</TableHead>
                            <TableHead className="w-[10%] text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {data?.users.map((u, index) => {
                            const no = (page - 1) * pageSize + index + 1;
                            return (
                                <TableRow key={u.id} className="align-top">
                                    <TableCell>
                                        <div className="text-sm text-center font-medium text-gray-700">{no}</div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="text-sm text-center text-gray-800">{u.profilePictureUrl}</div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="text-sm font-medium text-gray-900">
                                            {u.firstName} {u.lastName}
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="text-sm text-gray-800">{u.email}</div>
                                        <div className="text-[11px] text-gray-500">
                                            Email confirmed: {u.isEmailConfirmed ? "Yes" : "No"}
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="text-sm text-center text-gray-800">{u.role}</div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="text-sm text-center text-gray-800">{u.subscriptionTier}</div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="text-sm text-center text-gray-800">{u.institutionName}</div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="text-sm text-center text-gray-800">{u.crawlQuotaUsed}/{u.crawlQuotaLimit}</div>
                                    </TableCell>

                                    <TableCell className="text-center">
                                        <div className={`inline-flex items-center text-center justify-center px-2 py-1 rounded-full text-xs font-medium ${getUserStatusClass(u.status)}`}>
                                            {getUserStatusLabel(u.status)}
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="text-sm text-center text-gray-800">
                                            {new Date(u.createdAt).toLocaleString()}
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button size="sm" variant="outline" className="text-xs">
                                                View
                                            </Button>
                                            <Button size="sm" className="text-xs btn btn-gradient-slow">
                                                Approve
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>

                </Table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">Page {data?.page ?? page} / {totalPages}</div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
                    <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
                </div>
            </div>
        </div>
    );
}

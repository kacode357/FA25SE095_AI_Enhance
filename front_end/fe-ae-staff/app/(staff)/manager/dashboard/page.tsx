"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { cn } from "@/lib/utils";
import { AdminUserItemResponse } from "@/types/admin/admin.response";
import {
    Gauge,
    MailCheck,
    RefreshCw,
    Search,
    UserCheck2,
    Users,
    UserX2,
} from "lucide-react";
import React, { useEffect, useMemo } from "react";

// Simple table components (could be extracted later)
function TableShell({ children }: { children: React.ReactNode }) {
	return (
		<div className="overflow-hidden rounded-xl border bg-card">
			<div className="relative w-full overflow-auto">
				<table className="w-full caption-bottom text-sm">{children}</table>
			</div>
		</div>
	);
}

export default function AdminDashboardPage() {
	const { listData, loadingList, error, fetchUsers } = useAdminUsers();

	useEffect(() => {
		fetchUsers({ page: 1, pageSize: 10 }).catch(() => {});
	}, [fetchUsers]);

	const metrics = useMemo(() => {
		const users = listData?.users || [];
		const total = listData?.totalCount ?? 0;
		const pending = users.filter((u) => u.status === "Pending").length; // may differ from dedicated endpoint
		const suspended = users.filter((u) => u.status === "Suspended").length;
		const active = users.filter((u) => u.status === "Active").length;
		const emailUnconfirmed = users.filter((u) => !u.isEmailConfirmed).length;
		// aggregate quota usage (approx based on fetched page)
		const quotaUsed = users.reduce((acc, u) => acc + (u.crawlQuotaUsed || 0), 0);
		const quotaLimit = users.reduce((acc, u) => acc + (u.crawlQuotaLimit || 0), 0);
		const quotaPct = quotaLimit ? Math.round((quotaUsed / quotaLimit) * 100) : 0;
		return {
			total,
			active,
			suspended,
			pending,
			emailUnconfirmed,
			quotaUsed,
			quotaLimit,
			quotaPct,
		};
	}, [listData]);

	const filteredUsers: AdminUserItemResponse[] = useMemo(() => {
		return listData?.users || [];
	}, [listData]);

	return (
		<div className="flex flex-col gap-8 pb-10">
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
					<p className="text-muted-foreground text-sm">Tổng quan hệ thống người dùng</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => fetchUsers({ page: 1, pageSize: 10 })}
						loading={loadingList}
					>
						<RefreshCw className="size-4" /> Làm mới
					</Button>
				</div>
			</div>

			{/* Metrics Grid */}
			<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
				<StatCard
					icon={Users}
					label="Tổng người dùng"
					value={metrics.total}
					description="Tất cả user (có thể phân trang)"
				/>
				<StatCard
					icon={UserCheck2}
						label="Đang hoạt động"
					value={metrics.active}
					description="Status = Active"
					variant="success"
				/>
				<StatCard
					icon={UserX2}
					label="Bị khóa"
					value={metrics.suspended}
					description="Status = Suspended"
					variant="destructive"
				/>
				<StatCard
					icon={MailCheck}
					label="Chưa xác thực email"
					value={metrics.emailUnconfirmed}
					description="Email chưa confirm"
					variant="warning"
				/>
			</div>

			{/* Quota & Pending */}
			<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
				<Card className="relative overflow-hidden">
					<CardHeader>
						<CardTitle>Quota sử dụng (trong trang hiện tại)</CardTitle>
						<CardDescription>
							Tổng crawl quota dùng / giới hạn của danh sách đang hiển thị
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col gap-4">
							<div className="flex items-end gap-2 text-3xl font-semibold">
								{metrics.quotaUsed}
								<span className="text-muted-foreground text-base font-normal">
									/ {metrics.quotaLimit}
								</span>
							</div>
																							<progress
																								className={cn(
																									"h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:transition-all",
																									metrics.quotaPct > 95
																										? "[&::-webkit-progress-value]:bg-red-500"
																										: metrics.quotaPct > 80
																										? "[&::-webkit-progress-value]:bg-orange-500"
																										: "[&::-webkit-progress-value]:bg-primary"
																								)}
																								value={metrics.quotaLimit ? metrics.quotaUsed : 0}
																								max={metrics.quotaLimit || 100}
																								aria-label="Tỷ lệ quota đã sử dụng"
																							/>
							<p className="text-muted-foreground text-xs">
								Ước tính: {metrics.quotaPct}% đã sử dụng (trên dữ liệu trang)
							</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Pending / Suspended</CardTitle>
						<CardDescription>Trạng thái quan trọng cần xử lý</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 gap-4">
							<MiniStatus label="Pending" value={metrics.pending} />
							<MiniStatus label="Suspended" value={metrics.suspended} variant="destructive" />
						</div>
					</CardContent>
					<CardFooter className="text-muted-foreground text-xs">
						(Pending lấy tạm thời từ list filter status = Pending)
					</CardFooter>
				</Card>
				<Card className="xl:col-span-1">
					<CardHeader>
						<CardTitle>Biểu đồ (Placeholder)</CardTitle>
						<CardDescription>Chèn chart lib sau</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex h-32 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
							Chart area
						</div>
					</CardContent>
				</Card>
			</div>

			{/* User Table */}
			<Card className="col-span-full">
				<CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
					<div>
						<CardTitle>Danh sách người dùng</CardTitle>
						<CardDescription>Trang {listData?.page} / {listData?.totalPages}</CardDescription>
					</div>
					<div className="relative w-full max-w-xs">
						<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
						<input
							placeholder="Tìm kiếm (chưa triển khai)"
							className="h-9 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
							disabled
						/>
					</div>
				</CardHeader>
				<CardContent className="p-0">
					{error && (
						<div className="px-6 pb-4 text-sm text-red-500">{error}</div>
					)}
					<TableShell>
						<thead className="[&_th]:h-9 [&_th]:px-4 [&_th]:text-left [&_th]:align-middle">
							<tr className="border-b">
								<th>Email</th>
								<th>Tên</th>
								<th>Role</th>
								<th>Status</th>
								<th>Subscription</th>
								<th>Crawl</th>
								<th>Last Login</th>
							</tr>
						</thead>
						<tbody className="[&_td]:px-4 [&_td]:py-3">
							{loadingList && (
								<tr>
									<td colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
										Đang tải dữ liệu...
									</td>
								</tr>
							)}
							{!loadingList && filteredUsers.length === 0 && (
								<tr>
									<td colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
										Không có dữ liệu
									</td>
								</tr>
							)}
							{!loadingList &&
								filteredUsers.map((u) => (
									<tr key={u.id} className="border-t">
										<td className="font-medium">{u.email}</td>
										<td>
											{u.firstName} {u.lastName}
										</td>
										<td>
											<Badge variant="outline">{u.role}</Badge>
										</td>
										<td>
											<StatusBadge status={u.status} />
										</td>
										<td>{u.subscriptionTier || "-"}</td>
										<td className="text-xs">
											{u.crawlQuotaUsed}/{u.crawlQuotaLimit}
										</td>
										<td className="text-xs text-muted-foreground">
											{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "-"}
										</td>
									</tr>
								))}
						</tbody>
					</TableShell>
				</CardContent>
				<CardFooter className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
					<p className="text-muted-foreground text-xs">
						Hiển thị {filteredUsers.length} người dùng trên trang hiện tại.
					</p>
					<div className="flex items-center gap-2">
						<Button
							size="sm"
							variant="outline"
							disabled={loadingList || (listData?.page || 1) <= 1}
							onClick={() =>
								fetchUsers({ page: (listData?.page || 1) - 1, pageSize: listData?.pageSize || 10 })
							}
						>
							Trang trước
						</Button>
						<Button
							size="sm"
							variant="outline"
							disabled={
								loadingList ||
								(listData?.page || 1) >= (listData?.totalPages || 1)
							}
							onClick={() =>
								fetchUsers({ page: (listData?.page || 1) + 1, pageSize: listData?.pageSize || 10 })
							}
						>
							Trang sau
						</Button>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}

/* ===== UI Sub Components ===== */
function StatCard({
	icon: Icon,
	label,
	value,
	description,
	variant,
}: {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	value: number;
	description?: string;
	variant?: "success" | "destructive" | "warning";
}) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{label}</CardTitle>
				<Icon
					className={cn(
						"size-5 text-muted-foreground",
						variant === "success" && "text-green-500",
						variant === "destructive" && "text-red-500",
						variant === "warning" && "text-orange-500"
					)}
				/>
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-semibold leading-none tracking-tight">
					{value}
				</div>
				{description && (
					<p className="text-muted-foreground mt-1 text-xs">{description}</p>
				)}
			</CardContent>
		</Card>
	);
}

function StatusBadge({ status }: { status: string }) {
	const color =
		status === "Active"
			? "bg-green-500/10 text-green-600 ring-green-500/20"
			: status === "Suspended"
			? "bg-red-500/10 text-red-600 ring-red-500/20"
			: status === "Pending"
			? "bg-orange-500/10 text-orange-600 ring-orange-500/20"
			: "bg-muted text-muted-foreground ring-muted";
	return (
		<span
			className={cn(
				"inline-flex h-6 items-center rounded-full px-2 text-xs font-medium ring-1 ring-inset",
				color
			)}
		>
			{status}
		</span>
	);
}

function MiniStatus({
	label,
	value,
	variant,
}: {
	label: string;
	value: number;
	variant?: "destructive" | "warning" | "success";
}) {
	return (
		<div className="flex flex-col gap-1 rounded-md border p-3">
			<div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
				{label}
				<Gauge className="size-3.5 opacity-70" />
			</div>
			<div
				className={cn(
					"text-lg font-semibold",
					variant === "destructive" && "text-red-600",
					variant === "warning" && "text-orange-600",
					variant === "success" && "text-green-600"
				)}
			>
				{value}
			</div>
		</div>
	);
}


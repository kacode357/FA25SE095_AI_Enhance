"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GroupItem } from "@/types/group.types";
import { Pencil, Plus, Trash2, UserPlus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import EmptyState from "../components/EmptyState";
import TableSkeleton from "../components/TableSkeleton";
import FilterRow from "./components/FilterRow";

export default function GroupPage() {
	const [loading] = useState(false);
	const [groups] = useState<GroupItem[]>([
		{ id: 'g1', name: 'Group 1', members: 4, max: 6, leader: 'Nguyen A', status: 'active', createdAt: "2025-09-18T08:30:00", updatedAt: "2025-09-19T09:15:00" },
		{ id: 'g2', name: 'Group 2', members: 6, max: 6, leader: 'Tran B', status: 'locked', createdAt: "2025-09-15T10:00:00", updatedAt: "2025-09-17T14:45:00" },
		{ id: 'g3', name: 'Group 3', members: 2, max: 6, leader: 'Le C', status: 'active', createdAt: "2025-09-10T13:20:00", updatedAt: "2025-09-12T11:10:00" },
	]);

	// Filters
	const [qName, setQName] = useState("");
	const [qLeader, setQLeader] = useState("");
	const [filterStatus, setFilterStatus] = useState<string>("all");
	const [minMembers, setMinMembers] = useState<string>("");
	const [maxMembers, setMaxMembers] = useState<string>("");
	const [createdFrom, setCreatedFrom] = useState<string>("");
	const [updatedFrom, setUpdatedFrom] = useState<string>("");

	const filtered = useMemo(() => {
		const createdFromTime = createdFrom ? new Date(createdFrom).getTime() : null;
		const updatedFromTime = updatedFrom ? new Date(updatedFrom).getTime() : null;
		const min = minMembers ? parseInt(minMembers, 10) : null;
		const max = maxMembers ? parseInt(maxMembers, 10) : null;
		return groups.filter(g => {
			if (qName.trim() && !g.name.toLowerCase().includes(qName.trim().toLowerCase())) return false;
			if (qLeader.trim() && !(g.leader || "").toLowerCase().includes(qLeader.trim().toLowerCase())) return false;
			if (filterStatus !== "all" && g.status !== filterStatus) return false;
			if (min !== null && g.members < min) return false;
			if (max !== null && g.members > max) return false;
			if (createdFromTime && new Date(g.createdAt).getTime() < createdFromTime) return false;
			if (updatedFromTime && new Date(g.updatedAt).getTime() < updatedFromTime) return false;
			return true;
		});
	}, [groups, qName, qLeader, filterStatus, minMembers, maxMembers, createdFrom, updatedFrom]);

	// format ngày giờ kiểu Việt Nam
	const formatDateTime = (dateStr: string) => {
		return new Date(dateStr).toLocaleString("vi-VN", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});
	};

	return (
		<div className="min-h-full flex flex-col p-2 bg-white text-slate-900">
			<header className="sticky top-0 z-20 flex flex-col gap-3 mb-4 bg-white/90 supports-[backdrop-filter]:backdrop-blur p-2 rounded-md border border-slate-200">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
					<p className="text-slate-600 text-sm relative pl-3 before:content-['•'] before:absolute before:left-0 before:text-slate-500">
						Create, allocate and track student groups.
					</p>
					<Button className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"><Plus className='size-4' />Create Group</Button>
				</div>
			</header>

			<Card className="bg-white border border-slate-200 flex-1 flex flex-col">
				<CardHeader className="flex flex-col gap-3">
					<CardTitle className="text-base text-slate-800">
						Groups Management <span className="text-slate-500">({filtered.length})</span>
					</CardTitle>
				</CardHeader>

				<CardContent className="px-0 flex-1 overflow-hidden">
					{filtered.length === 0 ? (
						<div className="p-6">
							<EmptyState title="No groups yet" description="Click Create Group to add the first one." icon={<Users className='size-10' />} />
						</div>
					) : (
						<div className="h-full overflow-auto">
							<Table className="table-auto w-full">
								<TableHeader className="sticky top-0 z-10 bg-slate-50">
									<TableRow className="text-slate-600 border-b border-t border-slate-200">
										<TableHead className="w-[20%] text-center relative py-5 font-bold">Group Name
											<div className="absolute top-1/2 -translate-y-1/2 right-0 h-6 w-[1px] bg-slate-200"></div>
										</TableHead>
										<TableHead className="w-[15%] text-center relative py-5 font-bold">Leader
											<div className="absolute top-1/2 -translate-y-1/2 right-0 h-6 w-[1px] bg-slate-200"></div>
										</TableHead>
										<TableHead className="w-[10%] text-center relative py-5 font-bold">Members
											<div className="absolute top-1/2 -translate-y-1/2 right-0 h-6 w-[1px] bg-slate-200"></div>
										</TableHead>
										<TableHead className="w-[10%] text-center relative py-5 font-bold">Status
											<div className="absolute top-1/2 -translate-y-1/2 right-0 h-6 w-[1px] bg-slate-200"></div>
										</TableHead>
										<TableHead className="w-[15%] text-center relative py-5 font-bold hidden xl:table-cell">Created At
											<div className="absolute top-1/2 -translate-y-1/2 right-0 h-6 w-[1px] bg-slate-200"></div>
										</TableHead>
										<TableHead className="w-[15%] text-center relative py-5 font-bold hidden xl:table-cell">Updated At
											<div className="absolute top-1/2 -translate-y-1/2 right-0 h-6 w-[1px] bg-slate-200"></div>
										</TableHead>
										<TableHead className="w-[5%] text-center py-5 font-bold">Actions</TableHead>
									</TableRow>
									<FilterRow
										qName={qName} setQName={setQName}
										qLeader={qLeader} setQLeader={setQLeader}
										minMembers={minMembers} setMinMembers={setMinMembers}
										maxMembers={maxMembers} setMaxMembers={setMaxMembers}
										filterStatus={filterStatus} setFilterStatus={setFilterStatus}
										createdFrom={createdFrom} setCreatedFrom={setCreatedFrom}
										updatedFrom={updatedFrom} setUpdatedFrom={setUpdatedFrom}
										resultCount={filtered.length}
										clearAll={() => { setQName(""); setQLeader(""); setFilterStatus("all"); setMinMembers(""); setMaxMembers(""); setCreatedFrom(""); setUpdatedFrom(""); }}
									/>
								</TableHeader>
								<TableBody>
									{loading && <TableSkeleton rows={5} columns={7} />}
									{!loading && filtered.map(g => (
										<TableRow key={g.id} className="border-b cursor-pointer border-slate-100 hover:bg-emerald-50/40">
											<TableCell className="px-4 py-2 font-medium text-slate-800">{g.name}</TableCell>
											<TableCell className="px-4 py-2 text-slate-600 text-xs">{g.leader}</TableCell>
											<TableCell className="px-4 text-center py-2 text-slate-600 text-xs">{g.members}/{g.max}</TableCell>
											<TableCell className="px-4 py-2 text-center">
												<span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${g.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>{g.status}</span>
											</TableCell>
											<TableCell className="pr-13 py-2 text-right text-xs text-slate-500 hidden xl:table-cell">{formatDateTime(g.createdAt)}</TableCell>
											<TableCell className="pr-13 py-2 text-right text-xs text-slate-500 hidden xl:table-cell">{formatDateTime(g.updatedAt)}</TableCell>
											<TableCell className="px-4 py-2 text-center">
												<div className="inline-flex gap-2">
													<Button variant='ghost' className='h-8 px-2 !bg-emerald-50 cursor-pointer text-emerald-700'><UserPlus className='size-4' /></Button>
													<Button variant='ghost' className='h-8 px-2 !bg-blue-50 cursor-pointer text-emerald-700'><Pencil className='size-4' /></Button>
													<Button variant='ghost' className='h-8 px-2 !bg-red-50 cursor-pointer text-red-600'><Trash2 className='size-4' /></Button>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GroupItem } from "@/types/group.types";
import { Plus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import EmptyState from "../components/EmptyState";
import FilterToolbar from "../components/FilterToolbar";
import GroupCard from "./components/GroupCard";

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
						<>
							<FilterToolbar
								rightSlot={
									<div className="flex items-center gap-2 text-[11px] text-slate-600">
										<span>{filtered.length} result{filtered.length !== 1 && 's'}</span>
										<button
											type="button"
											className="h-7 px-2 rounded bg-slate-100 hover:bg-slate-200"
											onClick={() => { setQName(""); setQLeader(""); setFilterStatus("all"); setMinMembers(""); setMaxMembers(""); setCreatedFrom(""); setUpdatedFrom(""); }}
										>
											Clear
										</button>
									</div>
								}
							>
								<input aria-label="Group name" placeholder="Group name" value={qName} onChange={(e)=>setQName(e.target.value)} className="h-8 w-full sm:w-64 text-xs rounded-md border border-slate-300 px-2" />
								<input aria-label="Leader" placeholder="Leader" value={qLeader} onChange={(e)=>setQLeader(e.target.value)} className="h-8 w-full sm:w-40 text-xs rounded-md border border-slate-300 px-2" />
								<input aria-label="Min members" type="number" placeholder="Min members" value={minMembers} onChange={(e)=>setMinMembers(e.target.value)} className="h-8 w-full sm:w-36 text-xs rounded-md border border-slate-300 px-2" />
								<input aria-label="Max members" type="number" placeholder="Max members" value={maxMembers} onChange={(e)=>setMaxMembers(e.target.value)} className="h-8 w-full sm:w-36 text-xs rounded-md border border-slate-300 px-2" />
								<select aria-label="Filter status" value={filterStatus} onChange={(e)=>setFilterStatus(e.target.value)} className="h-8 w-full sm:w-36 text-xs rounded-md border border-slate-300 px-2 bg-white">
									<option value="all">All</option>
									<option value="active">Active</option>
									<option value="locked">Locked</option>
								</select>
								<input aria-label="Filter created from" type="date" value={createdFrom} onChange={(e)=>setCreatedFrom(e.target.value)} className="h-8 w-full sm:w-40 text-xs rounded-md border border-slate-300 px-2" />
								<input aria-label="Filter updated from" type="date" value={updatedFrom} onChange={(e)=>setUpdatedFrom(e.target.value)} className="h-8 w-full sm:w-40 text-xs rounded-md border border-slate-300 px-2" />
							</FilterToolbar>
							<div className="p-3 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
								{filtered.map(g => (
									<GroupCard key={g.id} item={g} />
								))}
							</div>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

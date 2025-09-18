"use client";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Trash2, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import EmptyState from "../components/EmptyState";

interface GroupItem { id: string; name: string; members: number; max: number; leader?: string; status: "active" | "locked"; }

export default function GroupPage() {
	const [groups] = useState<GroupItem[]>([
		{ id: 'g1', name: 'Group 1', members: 4, max: 6, leader: 'Nguyen A', status: 'active' },
		{ id: 'g2', name: 'Group 2', members: 6, max: 6, leader: 'Tran B', status: 'locked' },
		{ id: 'g3', name: 'Group 3', members: 2, max: 6, leader: 'Le C', status: 'active' },
	]);

	return (
		<div className="min-h-full flex flex-col p-2 bg-white text-slate-900">
			<header className="sticky top-0 z-20 flex flex-col gap-3 mb-4 bg-white/90 supports-[backdrop-filter]:backdrop-blur p-2 rounded-md border border-slate-200">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
					<p className="text-slate-600 text-sm relative pl-3 before:content-['•'] before:absolute before:left-0 before:text-slate-500">
						Create, allocate and track student groups.
					</p>
					<Button className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"><Plus className='size-4'/>Create Group</Button>
				</div>
			</header>

			{groups.length === 0 ? (
				<EmptyState title="No groups yet" description="Click Create Group to add the first one." icon={<Users className='size-10'/>} />
			) : (
				<div className="overflow-auto border border-slate-200 rounded-lg">
					<table className="w-full text-sm">
						<thead className="bg-slate-50 text-slate-600">
							<tr>
								<th className="text-left font-medium px-4 py-2 w-[30%]">Group Name</th>
								<th className="text-left font-medium px-4 py-2">Leader</th>
								<th className="text-left font-medium px-4 py-2">Members</th>
								<th className="text-left font-medium px-4 py-2">Status</th>
								<th className="text-center font-medium px-4 py-2">Actions</th>
							</tr>
						</thead>
						<tbody>
							{groups.map(g => (
								<tr key={g.id} className="border-t border-slate-100 hover:bg-emerald-50/40">
									<td className="px-4 py-2 font-medium text-slate-800">{g.name}</td>
									<td className="px-4 py-2 text-slate-600 text-xs">{g.leader}</td>
									<td className="px-4 py-2 text-slate-600 text-xs">{g.members}/{g.max}</td>
									<td className="px-4 py-2">
										<span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${g.status==='active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>{g.status}</span>
									</td>
									<td className="px-4 py-2 text-center">
										<div className="inline-flex gap-2">
											<Button variant='ghost' className='h-8 px-2 text-emerald-700'><Pencil className='size-4'/>Edit</Button>
											<Button variant='ghost' className='h-8 px-2 text-emerald-700'><UserPlus className='size-4'/>Add Member</Button>
											<Button variant='ghost' className='h-8 px-2 text-red-600'><Trash2 className='size-4'/>Delete</Button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}

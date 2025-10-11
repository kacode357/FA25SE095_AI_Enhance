"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileItem } from "@/types/file.types";
import { DownloadCloud, FileText } from "lucide-react";
import { useMemo, useState } from "react";
import EmptyState from "../components/EmptyState";
import FilterToolbar from "../components/FilterToolbar";
import UploadArea from "../components/UploadArea";
import FileCard from "./components/FileCard";

export default function FilePage() {
	const [loading] = useState(false);
	const [files] = useState<FileItem[]>([
		{ id: "1", name: "Course Outline.pdf", sizeKB: 320, type: "pdf", uploadedAt: "2025-09-19T13:29:00Z", owner: "Lecturer" },
		{ id: "2", name: "Week1 Schedule.xlsx", sizeKB: 88, type: "xlsx", uploadedAt: "2025-09-18T09:15:30Z", owner: "Lecturer" },
	]);

	// Filters
	const [qName, setQName] = useState("");
	const [typeFilter, setTypeFilter] = useState("all");
	const [ownerFilter, setOwnerFilter] = useState("all");
	const [uploadedFrom, setUploadedFrom] = useState<string>("");
	const [uploadedTo, setUploadedTo] = useState<string>("");

	const filtered = useMemo(() => {
		return files.filter(f => {
			if (qName.trim() && !f.name.toLowerCase().includes(qName.trim().toLowerCase())) return false;
			if (typeFilter !== "all" && f.type !== typeFilter) return false;
			if (ownerFilter !== "all" && f.owner !== ownerFilter) return false;
			if (uploadedFrom) {
				const from = new Date(uploadedFrom);
				if (new Date(f.uploadedAt) < from) return false;
			}
			if (uploadedTo) {
				const to = new Date(uploadedTo);
				// include the day end to make filter inclusive
				to.setHours(23, 59, 59, 999);
				if (new Date(f.uploadedAt) > to) return false;
			}
			return true;
		});
	}, [files, qName, typeFilter, ownerFilter, uploadedFrom, uploadedTo]);

	return (
		<div className="min-h-full flex flex-col p-2 bg-white text-slate-900">
			<header className="sticky top-0 z-20 flex flex-col gap-3 mb-4 bg-white/90 supports-[backdrop-filter]:backdrop-blur p-2 rounded-md border border-slate-200">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
					<p className="text-slate-600 text-sm relative pl-3 before:content-['•'] before:absolute before:left-0 before:text-slate-500">
						Upload, manage and share documents with students.
					</p>
					<div className="flex gap-2">
						<Button className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1">
							<DownloadCloud className="size-4" />
							Download All
						</Button>
					</div>
				</div>
			</header>

			<div className="grid gap-8 xl:grid-cols-3">
				<div className="xl:col-span-1">
					<h2 className="text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wide">Upload</h2>
					<UploadArea />
				</div>
				<div className="xl:col-span-2">
					<Card className="bg-white border border-slate-200 flex-1 flex flex-col">
						<CardHeader className="flex flex-col gap-3">
							<CardTitle className="text-base text-slate-800">
								Files Management <span className="text-slate-500">({filtered.length})</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="px-0 flex-1 overflow-hidden">
							{filtered.length === 0 ? (
								<div className="p-6">
									<EmptyState
										title="No files"
										description="Upload the first document for the class."
										icon={<FileText className="size-10" />}
									/>
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
													onClick={() => { setQName(""); setTypeFilter("all"); setOwnerFilter("all"); setUploadedFrom(""); setUploadedTo(""); }}
												>
													Clear
												</button>
											</div>
										}
									>
										<input aria-label="Search file name" placeholder="Search file name" value={qName} onChange={(e)=>setQName(e.target.value)} className="h-8 w-full sm:w-64 text-xs rounded-md border border-slate-300 px-2" />
										<select aria-label="Filter type" value={typeFilter} onChange={(e)=>setTypeFilter(e.target.value)} className="h-8 w-full sm:w-36 text-xs rounded-md border border-slate-300 px-2 bg-white">
											<option value="all">All types</option>
											<option value="pdf">PDF</option>
											<option value="xlsx">XLSX</option>
											<option value="docx">DOCX</option>
										</select>
										<select aria-label="Filter owner" value={ownerFilter} onChange={(e)=>setOwnerFilter(e.target.value)} className="h-8 w-full sm:w-36 text-xs rounded-md border border-slate-300 px-2 bg-white">
											<option value="all">All owners</option>
											<option value="Lecturer">Lecturer</option>
											<option value="Student">Student</option>
										</select>
										<input aria-label="Uploaded from" type="date" value={uploadedFrom} onChange={(e)=>setUploadedFrom(e.target.value)} className="h-8 w-full sm:w-40 text-xs rounded-md border border-slate-300 px-2" />
										<input aria-label="Uploaded to" type="date" value={uploadedTo} onChange={(e)=>setUploadedTo(e.target.value)} className="h-8 w-full sm:w-40 text-xs rounded-md border border-slate-300 px-2" />
									</FilterToolbar>
									<div className="p-3 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
										{filtered.map(f => (
											<FileCard key={f.id} item={f} />
										))}
									</div>
								</>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

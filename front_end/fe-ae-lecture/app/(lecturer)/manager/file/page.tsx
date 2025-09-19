"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DownloadCloud, Eye, FileText, HardDriveDownload } from "lucide-react";
import { useMemo, useState } from "react";
import EmptyState from "../components/EmptyState";
import TableSkeleton from "../components/TableSkeleton";
import UploadArea from "../components/UploadArea";
import FilterRow from "./components/FilterRow";

type FileItem = { id: string; name: string; sizeKB: number; type: string; uploadedAt: string; owner: string };

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
								<div className="h-full overflow-auto">
									<Table className="table-auto w-full">
										<TableHeader className="sticky top-0 z-10 bg-slate-50">
											<TableRow className="text-slate-600 border-b border-t border-slate-200">
												<TableHead className="w-[30%] text-center relative py-5 font-bold">
													File Name
													<div className="absolute top-1/2 -translate-y-1/2 right-0 h-6 w-[1px] bg-slate-200"></div>
												</TableHead>
												<TableHead className="text-center relative py-5 font-bold">
													Type
													<div className="absolute top-1/2 -translate-y-1/2 right-0 h-6 w-[1px] bg-slate-200"></div>
												</TableHead>
												<TableHead className="text-center relative py-5 font-bold">
													Size
													<div className="absolute top-1/2 -translate-y-1/2 right-0 h-6 w-[1px] bg-slate-200"></div>
												</TableHead>
												<TableHead className="text-center relative py-5 font-bold">
													Owner
													<div className="absolute top-1/2 -translate-y-1/2 right-0 h-6 w-[1px] bg-slate-200"></div>
												</TableHead>
												<TableHead className="text-center relative py-5 font-bold hidden xl:table-cell">
													Uploaded
													<div className="absolute top-1/2 -translate-y-1/2 right-0 h-6 w-[1px] bg-slate-200"></div>
												</TableHead>
												<TableHead className="text-center py-5 font-bold">Actions</TableHead>
											</TableRow>
											<FilterRow
												qName={qName} setQName={setQName}
												typeFilter={typeFilter} setTypeFilter={setTypeFilter}
												ownerFilter={ownerFilter} setOwnerFilter={setOwnerFilter}
												uploadedFrom={uploadedFrom} setUploadedFrom={setUploadedFrom}
												uploadedTo={uploadedTo} setUploadedTo={setUploadedTo}
												resultCount={filtered.length}
												clearAll={() => { setQName(""); setTypeFilter("all"); setOwnerFilter("all"); setUploadedFrom(""); setUploadedTo(""); }}
											/>
										</TableHeader>
										<TableBody>
											{loading && <TableSkeleton rows={5} columns={6} />}
											{!loading &&
												filtered.map(f => (
													<TableRow key={f.id} className="border-t border-slate-100 hover:bg-emerald-50/40">
														<TableCell className="px-4 py-2 cursor-pointer font-medium text-slate-800">{f.name}</TableCell>
														<TableCell className="px-4 py-2 cursor-pointer text-center text-slate-600 uppercase text-[11px]">
															{f.type}
														</TableCell>
														<TableCell className="px-4 py-2 cursor-pointer text-center text-slate-600">{f.sizeKB} KB</TableCell>
														<TableCell className="px-4 py-2 cursor-pointer text-center text-slate-600">{f.owner}</TableCell>
														<TableCell className="px-4 py-2 cursor-pointer text-center text-slate-500 text-xs whitespace-nowrap hidden xl:table-cell">
															{new Date(f.uploadedAt).toLocaleString("vi-VN", {
																day: "2-digit",
																month: "2-digit",
																year: "numeric",
																hour: "2-digit",
																minute: "2-digit",
																second: "2-digit",
															})}
														</TableCell>
														<TableCell className="px-4 py-2 cursor-pointer text-center">
															<div className="inline-flex gap-2">
																<Button variant="ghost" className="h-8 px-2 cursor-pointer !bg-blue-50 text-emerald-700">
																	<Eye className="size-4" />
																</Button>
																<Button variant="ghost" className="h-8 px-2 cursor-pointer !bg-emerald-50 text-emerald-700">
																	<HardDriveDownload className="size-4" />
																</Button>
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
			</div>
		</div>
	);
}

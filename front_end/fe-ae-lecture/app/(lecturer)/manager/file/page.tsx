"use client";
import { Button } from "@/components/ui/button";
import { DownloadCloud, FileText, Filter } from "lucide-react";
import { useState } from "react";
import EmptyState from "../components/EmptyState";
import UploadArea from "../components/UploadArea";

type FileItem = { id: string; name: string; sizeKB: number; type: string; uploadedAt: string; owner: string };

export default function FilePage() {
	const [files] = useState<FileItem[]>([
		{ id: "1", name: "Course Outline.pdf", sizeKB: 320, type: "pdf", uploadedAt: new Date().toISOString(), owner: "Lecturer" },
		{ id: "2", name: "Week1 Schedule.xlsx", sizeKB: 88, type: "xlsx", uploadedAt: new Date().toISOString(), owner: "Lecturer" },
	]);

	return (
		<div className="min-h-full flex flex-col p-2 bg-white text-slate-900">
			<header className="sticky top-0 z-20 flex flex-col gap-3 mb-4 bg-white/90 supports-[backdrop-filter]:backdrop-blur p-2 rounded-md border border-slate-200">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
					<p className="text-slate-600 text-sm relative pl-3 before:content-['•'] before:absolute before:left-0 before:text-slate-500">
						Upload, manage and share documents with students.
					</p>
					<div className="flex gap-2">
						<Button variant="ghost" className="h-9 px-3 text-slate-600 flex items-center gap-1"><Filter className="size-4" />Filter</Button>
						<Button className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"><DownloadCloud className="size-4" />Download All</Button>
					</div>
				</div>
			</header>

			<div className="grid gap-8 xl:grid-cols-3">
				<div className="xl:col-span-1">
					<h2 className="text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wide">Upload</h2>
					<UploadArea />
				</div>
				<div className="xl:col-span-2">
					<h2 className="text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wide">Files</h2>
					{files.length === 0 ? (
						<EmptyState title="No files" description="Upload the first document for the class." icon={<FileText className='size-10' />} />
					) : (
						<div className="overflow-auto border border-slate-200 rounded-lg">
							<table className="w-full text-sm">
								<thead className="bg-slate-50 text-slate-600">
									<tr>
										<th className="text-left font-medium px-4 py-2 w-[40%]">File Name</th>
										<th className="text-left font-medium px-4 py-2">Type</th>
										<th className="text-left font-medium px-4 py-2">Size</th>
										<th className="text-left font-medium px-4 py-2">Owner</th>
										<th className="text-left font-medium px-4 py-2">Uploaded</th>
										<th className="text-center font-medium px-4 py-2">Actions</th>
									</tr>
								</thead>
								<tbody>
									{files.map(f => (
										<tr key={f.id} className="border-t border-slate-100 hover:bg-emerald-50/40">
											<td className="px-4 py-2 font-medium text-slate-800">{f.name}</td>
											<td className="px-4 py-2 text-slate-600 uppercase text-[11px]">{f.type}</td>
											<td className="px-4 py-2 text-slate-600">{f.sizeKB} KB</td>
											<td className="px-4 py-2 text-slate-600">{f.owner}</td>
											<td className="px-4 py-2 text-slate-500 text-xs whitespace-nowrap">{new Date(f.uploadedAt).toLocaleDateString('vi-VN')}</td>
											<td className="px-4 py-2 text-center">
												<div className="inline-flex gap-2">
													<Button variant="ghost" className="h-8 px-2 text-emerald-700">View</Button>
													<Button variant="ghost" className="h-8 px-2 text-emerald-700">Download</Button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

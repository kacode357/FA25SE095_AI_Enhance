"use client";
import { Card } from "@/components/ui/card";
import { useParams } from "next/navigation";
import Breadcrumbs from "../../components/Breadcrumbs";

export default function FileDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;

  return (
    <div className="p-3 space-y-3">
      <Breadcrumbs items={[
        { label: "Manager", href: "/manager" },
        { label: "Files", href: "/manager/file" },
        { label: `Detail #${id}` }
      ]} />

      <Card className="p-4">File details coming soon (UI only).</Card>
    </div>
  );
}

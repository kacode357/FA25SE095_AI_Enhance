"use client";
import { Card } from "@/components/ui/card";
import { useParams } from "next/navigation";
import Breadcrumbs from "../../components/Breadcrumbs";

export default function AssignmentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;

  return (
    <div className="p-3 space-y-3">
      <Breadcrumbs items={[
        { label: "Manager", href: "/manager" },
        { label: "Assignments", href: "/manager/assignment" },
        { label: `Detail #${id}` }
      ]} />

      <Card className="p-4">Assignment details coming soon (UI only).</Card>
    </div>
  );
}

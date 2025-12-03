// components/StatCard.tsx
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export function StatCard({
    title,
    value,
    icon,
    color,
    badge,
    suffix = "",
    loading = false,
}: {
    title: string;
    value: any;
    icon: React.ReactNode;
    color: string;
    badge?: string | null;
    suffix?: string;
    loading?: boolean;
}) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative overflow-hidden rounded-2xl bg-white shadow-lg border border-gray-100"
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-10`} />
            <div className="relative p-6">
                {loading ? (
                    <>
                        <Skeleton className="h-6 w-24 mb-3" />
                        <Skeleton className="h-10 w-32" />
                    </>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-md`}>
                                {icon}
                            </div>
                            {badge && <Badge variant="destructive">{badge}</Badge>}
                        </div>
                        <p className="text-sm text-gray-600">{title}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">
                            {value}{suffix}
                        </p>
                    </>
                )}
            </div>
        </motion.div>
    );
}
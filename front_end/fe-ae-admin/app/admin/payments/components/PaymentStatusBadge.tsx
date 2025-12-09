import { Badge } from "@/components/ui/badge";
import { SubscriptionPaymentStatus } from "@/types/payments/payment.response";
import { CheckCircle2, Clock, XCircle, AlertCircle, Ban } from "lucide-react";

export function PaymentStatusBadge({ status }: { status: SubscriptionPaymentStatus }) {
  switch (status) {
    case SubscriptionPaymentStatus.Paid:
      return (
        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 gap-1 pr-2.5">
          <CheckCircle2 className="h-3 w-3" /> Paid
        </Badge>
      );
    case SubscriptionPaymentStatus.Pending:
      return (
        <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 gap-1 pr-2.5">
          <Clock className="h-3 w-3" /> Pending
        </Badge>
      );
    case SubscriptionPaymentStatus.Processing:
      return (
        <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 gap-1 pr-2.5">
          <Clock className="h-3 w-3" /> Processing
        </Badge>
      );
    case SubscriptionPaymentStatus.Failed:
      return (
        <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 gap-1 pr-2.5">
          <AlertCircle className="h-3 w-3" /> Failed
        </Badge>
      );
    case SubscriptionPaymentStatus.Cancelled:
      return (
        <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700 gap-1 pr-2.5">
          <Ban className="h-3 w-3" /> Cancelled
        </Badge>
      );
    case SubscriptionPaymentStatus.Expired:
      return (
        <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-600 gap-1 pr-2.5">
          <XCircle className="h-3 w-3" /> Expired
        </Badge>
      );
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}
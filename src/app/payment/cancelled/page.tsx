import { XCircle } from "lucide-react";

/**
 * 支付取消页面
 */
export default function PaymentCancelledPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-950/50 border border-red-800/50 flex items-center justify-center">
          <XCircle className="w-8 h-8 text-red-400" />
        </div>
        <div>
          <h1 className="text-xl font-heading font-semibold mb-2">
            Payment cancelled
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            No charges were made. You can try again whenever you&apos;re ready.
          </p>
        </div>
      </div>
    </div>
  );
}

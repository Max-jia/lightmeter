import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

/**
 * 支付结果页面
 */
export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center space-y-6">
        {session_id ? (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-green-950/50 border border-green-800/50 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h1 className="text-xl font-heading font-semibold mb-2">
                Payment confirmed!
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Your payment has been processed successfully. The photographer
                will be notified.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-red-950/50 border border-red-800/50 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h1 className="text-xl font-heading font-semibold mb-2">
                Payment cancelled
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)]">
                The payment was cancelled. No charges were made.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

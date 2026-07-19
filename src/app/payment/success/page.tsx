"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

/**
 * Stripe 支付成功页面
 * 显示 2 秒后自动跳转 Dashboard
 */
export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#1A1816]">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-green-950/50 border border-green-800/50 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <div>
          <h1 className="text-xl font-heading font-semibold mb-2">
            Payment confirmed!
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    </div>
  );
}

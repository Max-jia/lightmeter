"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Loader } from "lucide-react";

export const dynamic = "force-dynamic";

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#1A1816]"><Loader className="w-10 h-10 animate-spin text-[var(--color-gold)]" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {

/**
 * 支付成功页面
 * 服务端处理数据更新，客户端展示结果
 */
export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Processing your payment...");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setMessage("No payment session found.");
      return;
    }

    // 调用 API 完成支付数据入库
    fetch("/api/stripe/fulfill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          setMessage("Payment confirmed! The photographer has been notified.");
        } else {
          setStatus("error");
          setMessage(data.error || "Failed to confirm payment.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong.");
      });
  }, [sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#1A1816]">
      <div className="w-full max-w-sm text-center space-y-6">
        {status === "loading" && (
          <>
            <Loader className="w-10 h-10 mx-auto animate-spin text-[var(--color-gold)]" />
            <h1 className="text-xl font-heading font-semibold">{message}</h1>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-green-950/50 border border-green-800/50 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h1 className="text-xl font-heading font-semibold mb-2">Payment confirmed!</h1>
              <p className="text-sm text-[var(--color-text-secondary)]">{message}</p>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-red-950/50 border border-red-800/50 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h1 className="text-xl font-heading font-semibold mb-2">Something went wrong</h1>
              <p className="text-sm text-[var(--color-text-secondary)]">{message}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

/**
 * 注册页面
 * 从价格卡片跳转时会带上 ?plan=standard 或 ?plan=pro
 * 14 天试用后按所选套餐自动扣款
 */
export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; error?: string }>;
}) {
  const { plan, error } = await searchParams;
  const selectedPlan = plan === "pro" ? "pro" : "standard";

  // 如果未配置 Supabase，直接显示注册表单
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return <SignupForm selectedPlan={selectedPlan} error={error} />;
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect("/dashboard");
  }

  return <SignupForm selectedPlan={selectedPlan} error={error} />;
}

function SignupForm({
  selectedPlan,
  error,
}: {
  selectedPlan: "standard" | "pro";
  error?: string;
}) {
  const planLabel = selectedPlan === "pro" ? "Pro" : "Standard";
  const planPrice = selectedPlan === "pro" ? "$35/mo" : "$19/mo";
  const planFeatures =
    selectedPlan === "pro"
      ? ["Unlimited AI replies", "Everything in Standard", "Multi-brand support", "Priority support"]
      : ["AI Inbox (100 replies/mo)", "One-Link proposals & contracts", "Dashboard & Analytics", "Calendar", "Stripe payments"];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#1A1816]">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1
            className="text-2xl font-heading font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Start your free trial
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            14 days free · Cancel anytime · No credit card required
          </p>
        </div>

        {/* Selected Plan Card */}
        <div className="p-5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-[var(--elevation-1)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${selectedPlan === "pro" ? "bg-[var(--color-gold)]" : "bg-[var(--color-text-disabled)]"}`} />
              <span className="text-sm font-heading font-semibold">{planLabel} Plan</span>
            </div>
            <span className="text-lg font-heading font-bold">{planPrice}</span>
          </div>
          <ul className="space-y-1.5">
            {planFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                <Check className="w-3.5 h-3.5 text-[var(--color-gold)] flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-3 pt-3 border-t border-[var(--color-border-subtle)] flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-gold)]" />
            You&apos;ll be charged after the 14-day trial ends.
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl bg-[var(--color-error-bg)] border border-[var(--color-error)]/20 text-sm text-[var(--color-error)] text-center">
            {decodeURIComponent(error)}
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" action="/api/auth/signup" method="POST">
          <input type="hidden" name="plan" value={selectedPlan} />
          <Input label="Full name" name="name" type="text" placeholder="Jane Smith" required />
          <Input label="Email" name="email" type="email" placeholder="jane@example.com" required />
          <Input label="Password" name="password" type="password" placeholder="Min. 8 characters" required />
          <Button type="submit" className="w-full" variant="gold" size="lg">
            Start {planLabel} free trial
          </Button>
        </form>

        {/* Switch plan */}
        {selectedPlan === "standard" ? (
          <p className="text-center text-sm text-[var(--color-text-secondary)]">
            Want unlimited AI replies?{" "}
            <Link href="/signup?plan=pro" className="text-[var(--color-gold)] hover:underline">
              Try Pro instead →
            </Link>
          </p>
        ) : (
          <p className="text-center text-sm text-[var(--color-text-secondary)]">
            Looking for a lighter plan?{" "}
            <Link href="/signup?plan=standard" className="text-[var(--color-gold)] hover:underline">
              Try Standard instead →
            </Link>
          </p>
        )}

        <p className="text-center text-sm text-[var(--color-text-secondary)]">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--color-text-primary)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

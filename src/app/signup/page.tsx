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

        {/* Google signup */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--color-border-subtle)]" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-[#1A1816] px-2 text-[var(--color-text-disabled)]">or</span></div>
        </div>
        <a href="/api/auth/google">
          <Button type="button" variant="secondary" className="w-full" size="lg">
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>
        </a>

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

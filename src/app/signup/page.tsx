"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { Check, Sparkles } from "lucide-react";

export default function SignupPage() {
  return <Suspense><SignupForm /></Suspense>;
}

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const selectedPlan = (params.get("plan") as "standard" | "pro") || "standard";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const planLabel = selectedPlan === "pro" ? "Pro" : "Standard";
  const planPrice = selectedPlan === "pro" ? "$35/mo" : "$19/mo";
  const planFeatures = selectedPlan === "pro"
    ? ["Unlimited AI replies", "Everything in Standard", "Multi-brand support", "Priority support"]
    : ["AI Inbox (100 replies/mo)", "One-Link proposals & contracts", "Dashboard & Analytics", "Calendar", "Stripe payments"];

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();

    const { error: signUpError } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name, plan: selectedPlan, trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() } },
    });
    if (signUpError && !signUpError.message?.includes("already registered") && signUpError.status !== 422) {
      setError(signUpError.message); setLoading(false); return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) { setError(signInError.message); setLoading(false); return; }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#1A1816]">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-heading font-semibold tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>Start your free trial</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">14 days free · Cancel anytime · No credit card required</p>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-[var(--elevation-1)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${planLabel === "Pro" ? "bg-[var(--color-gold)]" : "bg-[var(--color-text-disabled)]"}`} /><span className="text-sm font-heading font-semibold">{planLabel} Plan</span></div>
            <span className="text-lg font-heading font-bold">{planPrice}</span>
          </div>
          <ul className="space-y-1.5">{planFeatures.map(f => <li key={f} className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]"><Check className="w-3.5 h-3.5 text-[var(--color-gold)]" />{f}</li>)}</ul>
          <div className="mt-3 pt-3 border-t border-[var(--color-border-subtle)] flex items-center gap-2 text-xs text-[var(--color-text-secondary)]"><Sparkles className="w-3.5 h-3.5 text-[var(--color-gold)]" />Charged after 14-day trial.</div>
        </div>
        {error && <div className="p-3 rounded-xl bg-[var(--color-error-bg)] border border-[var(--color-error)]/20 text-sm text-[var(--color-error)] text-center">{error}</div>}
        <form className="space-y-4" onSubmit={handleSignup}>
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" required />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" required />
          <Button type="submit" className="w-full" variant="gold" size="lg" loading={loading}>Start {planLabel} free trial</Button>
        </form>
        <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--color-border-subtle)]" /></div><div className="relative flex justify-center text-xs"><span className="bg-[#1A1816] px-2 text-[var(--color-text-disabled)]">or</span></div></div>
        <a href="/api/auth/google"><Button type="button" variant="secondary" className="w-full" size="lg">Continue with Google</Button></a>
        <p className="text-center text-sm text-[var(--color-text-secondary)]">Already have an account? <Link href="/login" className="text-[var(--color-text-primary)] hover:underline">Sign in</Link></p>
      </div>
    </div>
  );
}

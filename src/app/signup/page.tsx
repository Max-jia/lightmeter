"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Sparkles } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPlan] = useState<"standard" | "pro">("standard");

  const friendlyError = (msg: string) => {
    if (msg.includes("already registered") || msg.includes("already exists") || msg.includes("unique")) return "An account with this email already exists. <a href='/login'>Sign in instead?</a>";
    if (msg.includes("rate limit") || msg.includes("rate_limit")) return "Too many signups. Please wait a moment and try again, or use Google login.";
    if (msg.includes("Password") && msg.includes("6")) return "Password must be at least 6 characters.";
    if (msg.includes("valid email") || msg.includes("email")) return "Please enter a valid email address.";
    return msg;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err) setError(friendlyError(err));
  }, []);

  const planLabel = selectedPlan === "pro" ? "Pro" : "Standard";
  const planPrice = selectedPlan === "pro" ? "$35/mo" : "$19/mo";
  const planFeatures = selectedPlan === "pro"
    ? ["Unlimited AI replies", "Everything in Standard", "Multi-brand support", "Priority support"]
    : ["AI Inbox (100 replies/mo)", "One-Link proposals & contracts", "Dashboard & Analytics", "Calendar", "Stripe payments"];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      e.preventDefault();
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      e.preventDefault();
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#1A1816]">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-heading font-semibold tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>Start your free trial</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Create your free account</p>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-[var(--elevation-1)]">
          <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${planLabel === "Pro" ? "bg-[var(--color-gold)]" : "bg-[var(--color-text-disabled)]"}`} /><span className="text-sm font-heading font-semibold">{planLabel} Plan</span></div><span className="text-lg font-heading font-bold">{planPrice}</span></div>
          <ul className="space-y-1.5">{planFeatures.map(f => <li key={f} className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]"><Check className="w-3.5 h-3.5 text-[var(--color-gold)]" />{f}</li>)}</ul>
          <div className="mt-3 pt-3 border-t border-[var(--color-border-subtle)] flex items-center gap-2 text-xs text-[var(--color-text-secondary)]"><Sparkles className="w-3.5 h-3.5 text-[var(--color-gold)]" />Charged after 14-day trial.</div>
        </div>
        {error && <div className="p-3 rounded-xl bg-[var(--color-error-bg)] border border-[var(--color-error)]/20 text-sm text-[var(--color-error)] text-center" dangerouslySetInnerHTML={{ __html: error }} />}
        <form className="space-y-4" action="/api/auth/signup" method="POST" onSubmit={handleSubmit}>
          <input type="hidden" name="plan" value={selectedPlan} />
          <Input label="Full name" name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" required />
          <Input label="Email" type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" required />
          <Input label="Password" type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" required helperText="At least 6 characters" />
          <Button type="submit" className="w-full" variant="gold" size="lg" loading={loading}>Start {planLabel} free trial</Button>
        </form>
        <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--color-border-subtle)]" /></div><div className="relative flex justify-center text-xs"><span className="bg-[#1A1816] px-2 text-[var(--color-text-disabled)]">or</span></div></div>
        <a href="/api/auth/google" className="inline-flex items-center justify-center gap-3 font-medium tracking-tight transition-all duration-[var(--duration-fast)] ease-[var(--spring-ios)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)] cursor-pointer select-none bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 hover:-translate-y-px hover:shadow-lg active:scale-[0.96] px-6 py-3.5 text-base rounded-2xl w-full no-underline">
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </a>
        <p className="text-center text-sm text-[var(--color-text-secondary)]">Already have an account? <Link href="/login" className="text-[var(--color-text-primary)] hover:underline">Sign in</Link></p>
      </div>
    </div>
  );
}

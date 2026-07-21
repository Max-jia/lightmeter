"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const friendlyError = (msg: string) => {
    if (msg.includes("Invalid login") || msg.includes("invalid_credentials")) return "Invalid email or password.";
    if (msg.includes("rate limit") || msg.includes("rate_limit")) return "Too many attempts. Please wait a moment and try again.";
    if (msg.includes("Email not confirmed")) return "Please confirm your email address first.";
    return msg;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { setError("Please enter both email and password."); return; }
    setLoading(true); setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(friendlyError(err.message)); setLoading(false); }
    else { router.push("/dashboard"); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-heading font-semibold tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>Lightmeter</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">AI CRM for photographers</p>
        </div>
        {error && <div className="p-3 rounded-xl bg-[var(--color-error-bg)] border border-[var(--color-error)]/20 text-sm text-[var(--color-error)] text-center">{error}</div>}
        <form className="space-y-4" onSubmit={handleLogin}>
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          <Button type="submit" className="w-full" size="lg" loading={loading}>Sign in</Button>
        </form>
        <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--color-border-subtle)]" /></div><div className="relative flex justify-center text-xs"><span className="bg-[var(--color-bg-base)] px-2 text-[var(--color-text-disabled)]">or</span></div></div>
        <a href="/api/auth/google"><Button type="button" variant="secondary" className="w-full" size="lg">Continue with Google</Button></a>
        <p className="text-center text-sm text-[var(--color-text-secondary)]">Don&apos;t have an account?{" "}<Link href="/signup" className="text-[var(--color-accent)] hover:underline">Start free trial</Link></p>
      </div>
    </div>
  );
}

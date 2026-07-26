"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Eye, Mail, X } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    const msg = params.get("info");
    if (err) setError(friendlyError(err));
    if (msg) setInfo(msg);
  }, []);

  const friendlyError = (msg: string) => {
    if (msg.includes("Invalid login") || msg.includes("invalid_credentials")) return "Invalid email or password.";
    if (msg.includes("rate limit") || msg.includes("rate_limit")) return "Too many attempts. Please wait a moment and try again.";
    if (msg.includes("Email not confirmed")) return "Please confirm your email address first.";
    return msg;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!email.trim() || !password.trim()) {
      e.preventDefault();
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
  };

  return (
    <div className="min-h-screen flex items-start justify-center p-4 pt-24 sm:pt-32 md:items-center md:pt-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-heading font-semibold tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>Lightmeter</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Welcome back</p>
        </div>
        {info && <div className="p-3 rounded-xl bg-[var(--color-gold-subtle)] border border-[var(--color-gold)]/20 text-sm text-[var(--color-text-secondary)] text-center">{info}</div>}
        {error && <div className="p-3 rounded-xl bg-[var(--color-error-bg)] border border-[var(--color-error)]/20 text-sm text-[var(--color-error)] text-center">{error}</div>}
        <form className="space-y-4" action="/api/auth/login" method="POST" onSubmit={handleSubmit}>
          <input type="text" name="prevent_autofill" autoComplete="off" style={{display:"none"}} tabIndex={-1} />
          <Input label="Email" type="email" name="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          <Input label="Password" type="password" name="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          <Button type="submit" className="w-full" size="lg" loading={loading}>Sign in</Button>
        </form>
        <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--color-border-subtle)]" /></div><div className="relative flex justify-center text-xs"><span className="bg-[var(--color-bg-base)] px-2 text-[var(--color-text-disabled)]">or</span></div></div>
        <button onClick={() => setShowGoogleModal(true)} className="inline-flex items-center justify-center gap-3 font-medium tracking-tight transition-all duration-[var(--duration-fast)] ease-[var(--spring-ios)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)] cursor-pointer select-none bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 hover:-translate-y-px hover:shadow-lg active:scale-[0.96] px-6 py-3.5 text-base rounded-2xl w-full no-underline">
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>

        {/* Google pre-auth modal */}
        {showGoogleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowGoogleModal(false)}>
            <div className="w-full max-w-sm bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border-default)] shadow-[var(--elevation-4)] p-6 space-y-5" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[var(--color-gold)]" />
                  <h2 className="text-base font-heading font-semibold">One quick thing</h2>
                </div>
                <button onClick={() => setShowGoogleModal(false)} className="p-1 rounded-lg hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-disabled)]"><X className="w-4 h-4" /></button>
              </div>

              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                Google shows an <span className="text-[var(--color-warning)] font-medium">"app not verified"</span> warning for all new apps. This is normal — our verification is in progress.
              </p>

              <div className="space-y-3">
                {[
                  { icon: Eye, text: "Lightmeter reads only photography-related emails. We cannot modify, delete, or send without your action." },
                  { icon: Shield, text: "You can revoke access anytime at myaccount.google.com/permissions." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <item.icon className="w-4 h-4 text-[var(--color-success)] mt-0.5 shrink-0" />
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>

              <a href="/api/auth/google" className="block w-full">
                <Button variant="gold" className="w-full" size="lg">Got it — continue with Google</Button>
              </a>
            </div>
          </div>
        )}
        <p className="text-center text-sm text-[var(--color-text-secondary)]">Don&apos;t have an account?{" "}<Link href="/signup" className="text-[var(--color-accent)] hover:underline">Start free trial</Link></p>
      </div>
    </div>
  );
}

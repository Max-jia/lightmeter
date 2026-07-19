"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Shield, CreditCard } from "lucide-react";

export default function SubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#1A1816]">
        <div className="w-12 h-12 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SubscribeForm />
    </Suspense>
  );
}

function SubscribeForm() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "standard";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const planLabel = plan === "pro" ? "Pro" : "Standard";
  const planPrice = plan === "pro" ? 35 : 19;
  const planAmount = plan === "pro" ? 3500 : 1900; // cents
  const planFeatures =
    plan === "pro"
      ? ["Unlimited AI replies", "Everything in Standard", "Multi-brand support", "Priority support"]
      : ["AI Inbox (100 replies/mo)", "One-Link proposals & contracts", "Dashboard & Analytics", "Calendar", "Stripe payments"];

  const handleSubscribe = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: planAmount,
          description: `Lightmeter ${planLabel} Plan — 14-day free trial`,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to create checkout");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#1A1816]">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--color-gold-subtle)] flex items-center justify-center">
            <CreditCard className="w-7 h-7 text-[var(--color-gold)]" />
          </div>
          <h1 className="text-2xl font-heading font-semibold tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Start your {planLabel} trial
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            14 days free, then {planPrice}/month. Cancel anytime.
          </p>
        </div>

        {/* Plan Card */}
        <Card depth={2} padding="lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-sm font-heading font-semibold">{planLabel} Plan</span>
              <p className="text-2xl font-heading font-bold mt-1">
                ${planPrice}
                <span className="text-sm font-normal text-[var(--color-text-secondary)]">/month</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[var(--color-gold-subtle)] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[var(--color-gold)]" />
            </div>
          </div>
          <ul className="space-y-2 mb-4">
            {planFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <Check className="w-4 h-4 text-[var(--color-gold)] flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-gold-subtle)] border border-[var(--color-gold)]/20 text-xs text-[var(--color-text-secondary)]">
            <Shield className="w-3.5 h-3.5 text-[var(--color-gold)] flex-shrink-0" />
            You won&apos;t be charged until your 14-day trial ends. Cancel anytime before then.
          </div>
        </Card>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl bg-[var(--color-error-bg)] border border-[var(--color-error)]/20 text-sm text-[var(--color-error)] text-center">
            {error}
          </div>
        )}

        {/* Subscribe button */}
        <Button variant="gold" size="lg" className="w-full" loading={loading} onClick={handleSubscribe}>
          Enter payment details
        </Button>

        <p className="text-center text-xs text-[var(--color-text-disabled)]">
          Secured by Stripe. Your card will be charged ${planPrice}/month after the 14-day trial.
        </p>
      </div>
    </div>
  );
}

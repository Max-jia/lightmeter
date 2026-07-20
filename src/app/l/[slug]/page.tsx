"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Check, Shield, ExternalLink } from "lucide-react";

export default function PublicLinkPage() {
  const { slug } = useParams<{ slug: string }>();
  const [link, setLink] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (slug) {
      fetch(`/api/links/${slug}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.link) setLink(d.link);
          else if (d.error) setError(d.error);
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to load link");
          setLoading(false);
        });
    }
  }, [slug]);

  const handlePay = async () => {
    setPaying(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkId: link.id,
          amount: link.proposal_amount,
          description: link.proposal_title,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to start checkout");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1A1816]">
        <div className="w-10 h-10 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !link) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1A1816] p-4">
        <div className="text-center space-y-4">
          <h1 className="text-xl font-heading font-semibold">Link not found</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">{error}</p>
        </div>
      </div>
    );
  }

  const amount = link.proposal_amount ? `$${(link.proposal_amount / 100).toLocaleString()}` : "$0";

  return (
    <div className="min-h-screen bg-[#1A1816] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[var(--color-gold-subtle)] flex items-center justify-center">
            <Camera className="w-6 h-6 text-[var(--color-gold)]" />
          </div>
          <h1 className="text-xl font-heading font-semibold" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            {link.proposal_title}
          </h1>
        </div>

        {/* Proposal */}
        <Card depth={2} padding="lg">
          {link.proposal_description && (
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">{link.proposal_description}</p>
          )}
          <div className="flex items-center justify-between py-3 border-t border-[var(--color-border-subtle)]">
            <span className="text-sm text-[var(--color-text-secondary)]">Total</span>
            <span className="text-2xl font-heading font-bold">{amount}</span>
          </div>
        </Card>

        {/* Features */}
        <div className="space-y-2">
          {[
            "Professional photography coverage",
            "High-resolution edited images",
            "Online gallery delivery",
          ].map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <Check className="w-4 h-4 text-[var(--color-gold)] flex-shrink-0" />
              {f}
            </div>
          ))}
        </div>

        {/* Pay button */}
        <Button variant="gold" size="lg" className="w-full" loading={paying} onClick={handlePay}>
          Pay {amount} with Card
        </Button>

        <div className="flex items-center gap-2 justify-center text-xs text-[var(--color-text-disabled)]">
          <Shield className="w-3 h-3" />
          Secured by Stripe
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[var(--color-error-bg)] border border-[var(--color-error)]/20 text-sm text-[var(--color-error)] text-center">
            {error}
          </div>
        )}

        {link.status === "paid" && (
          <div className="p-4 rounded-xl bg-[var(--color-success-bg)] border border-[var(--color-success)]/20 text-center">
            <Check className="w-6 h-6 text-[var(--color-success)] mx-auto mb-2" />
            <p className="text-sm font-medium text-[var(--color-success)]">Payment received — thank you!</p>
          </div>
        )}
      </div>
    </div>
  );
}

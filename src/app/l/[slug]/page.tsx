"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Camera, Check, Shield, PenLine } from "lucide-react";

export default function PublicLinkPage() {
  const { slug } = useParams<{ slug: string }>();
  const [link, setLink] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  // 合同签署状态
  const [signName, setSignName] = useState("");
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    if (slug) {
      fetch(`/api/links/${slug}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.link) {
            setLink(d.link);
            setSigned(!!d.link.contract_signed_at);
          } else setError(d.error);
          setLoading(false);
        })
        .catch(() => { setError("Failed to load link"); setLoading(false); });
    }
  }, [slug]);

  const handleSign = async () => {
    if (!signName.trim()) return;
    setSigning(true);
    try {
      const res = await fetch(`/api/links/${slug}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: signName.trim() }),
      });
      const data = await res.json();
      if (data.success) setSigned(true);
      else setError(data.error || "Signing failed");
    } catch { setError("Something went wrong"); }
    finally { setSigning(false); }
  };

  const handlePay = async () => {
    setPaying(true); setError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId: link.id, amount: link.proposal_amount, description: link.proposal_title }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError(data.error || "Failed");
    } catch { setError("Something went wrong"); }
    finally { setPaying(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#1A1816]"><div className="w-10 h-10 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" /></div>;
  if (error && !link) return <div className="min-h-screen flex items-center justify-center bg-[#1A1816] p-4"><div className="text-center space-y-4"><h1 className="text-xl font-heading font-semibold">Link not found</h1><p className="text-sm text-[var(--color-text-secondary)]">{error}</p></div></div>;

  const amount = link.proposal_amount ? `$${(link.proposal_amount / 100).toLocaleString()}` : "$0";

  return (
    <div className="min-h-screen bg-[#1A1816] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[var(--color-gold-subtle)] flex items-center justify-center">
            <Camera className="w-6 h-6 text-[var(--color-gold)]" />
          </div>
          <h1 className="text-xl font-heading font-semibold" style={{ fontFamily: "var(--font-space-grotesk)" }}>{link.proposal_title}</h1>
        </div>

        {/* Step 1: Contract */}
        <Card depth={2} padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <PenLine className="w-4 h-4 text-[var(--color-gold)]" />
            <h2 className="text-sm font-heading font-semibold">Contract</h2>
          </div>
          {link.contract_template ? (
            <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap mb-4 max-h-48 overflow-y-auto">
              {link.contract_template}
            </div>
          ) : (
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">By signing, you agree to the photography services outlined in this proposal.</p>
          )}
          {signed ? (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-success-bg)] border border-[var(--color-success)]/20">
              <Check className="w-5 h-5 text-[var(--color-success)]" />
              <div>
                <p className="text-sm font-medium text-[var(--color-success)]">Signed by {link.contract_signed_by || "Client"}</p>
                <p className="text-xs text-[var(--color-text-disabled)]">{link.contract_signed_at ? new Date(link.contract_signed_at).toLocaleString() : ""}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Input label="Your full name" value={signName} onChange={(e) => setSignName(e.target.value)} placeholder="Jane Smith" />
              <Button variant="gold" className="w-full" loading={signing} onClick={handleSign} disabled={!signName.trim()}>
                Sign Contract
              </Button>
              <p className="text-xs text-[var(--color-text-disabled)] text-center">By signing, you agree to the terms above.</p>
            </div>
          )}
        </Card>

        {/* Step 2: Payment */}
        <Card depth={2} padding="lg">
          {link.proposal_description && <p className="text-sm text-[var(--color-text-secondary)] mb-4">{link.proposal_description}</p>}
          <div className="flex items-center justify-between py-3 border-t border-[var(--color-border-subtle)]">
            <span className="text-sm text-[var(--color-text-secondary)]">Total</span>
            <span className="text-2xl font-heading font-bold">{amount}</span>
          </div>
        </Card>

        <div className="space-y-2">
          {["Professional photography coverage", "High-resolution edited images", "Online gallery delivery"].map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]"><Check className="w-4 h-4 text-[var(--color-gold)] flex-shrink-0" />{f}</div>
          ))}
        </div>

        <Button variant="gold" size="lg" className="w-full" loading={paying} onClick={handlePay} disabled={!signed}>
          {!signed ? "Sign contract first" : `Pay ${amount} with Card`}
        </Button>

        <div className="flex items-center gap-2 justify-center text-xs text-[var(--color-text-disabled)]"><Shield className="w-3 h-3" />Secured by Stripe</div>

        {error && <div className="p-3 rounded-xl bg-[var(--color-error-bg)] border border-[var(--color-error)]/20 text-sm text-[var(--color-error)] text-center">{error}</div>}

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

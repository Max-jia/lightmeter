"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, CreditCard, Globe } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const { call, loading } = useApi<any>();
  const [tone, setTone] = useState("professional");
  const [studioName, setStudioName] = useState("");
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);

  // 显示 Stripe Connect 结果
  useEffect(() => {
    const connectError = searchParams.get("connect_error");
    const connectSuccess = searchParams.get("connect");
    if (connectError) toast.error(decodeURIComponent(connectError));
    if (connectSuccess) toast.success("Stripe account connected!");
  }, []);

  // 加载当前设置
  useEffect(() => {
    fetch("/api/emails/list") // 随便调一个需要 auth 的接口
      .catch(() => {});
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const res = await fetch("/api/profile");
    if (res.ok) {
      const data = await res.json();
      setTone(data.reply_tone || "professional");
      setStudioName(data.studio_name || "");
      setFullName(data.full_name || "");
    }
  };

  // 保存 AI 语气
  const saveTone = async (newTone: string) => {
    setTone(newTone);
    setSaving(true);
    const result = await call("/api/profile", {
      method: "PATCH",
      body: JSON.stringify({ reply_tone: newTone }),
    });
    if (result) toast.success("AI tone saved");
    else setTone(tone); // 回滚
    setSaving(false);
  };

  // 保存资料
  const saveProfile = async () => {
    setSaving(true);
    const result = await call("/api/profile", {
      method: "PATCH",
      body: JSON.stringify({ studio_name: studioName, full_name: fullName }),
    });
    if (result) toast.success("Profile saved");
    setSaving(false);
  };

  const tones = [
    { key: "professional", label: "Professional", desc: "Warm but polished" },
    { key: "friendly", label: "Friendly", desc: "Casual and excited" },
    { key: "minimal", label: "Minimal", desc: "Short and to the point" },
  ];

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-heading font-semibold tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>
          Settings
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Manage your profile and AI preferences.
        </p>
      </div>

      {/* Profile */}
      <Card padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-[var(--color-text-secondary)]" />
          <h2 className="text-sm font-heading font-semibold">Profile</h2>
        </div>
        <div className="space-y-4">
          <Input label="Studio name" value={studioName} onChange={(e) => setStudioName(e.target.value)} placeholder="My Photo Studio" />
          <Input label="Your name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Smith" />
          <Button size="sm" onClick={saveProfile} loading={saving}>Save profile</Button>
        </div>
      </Card>

      {/* AI Reply Tone */}
      <Card padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-[var(--color-text-secondary)]" />
          <h2 className="text-sm font-heading font-semibold">AI Reply Tone</h2>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)] mb-3">
          This controls how AI drafts your email replies.
        </p>
        <div className="space-y-2">
          {tones.map((t) => (
            <button
              key={t.key}
              onClick={() => saveTone(t.key)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                tone === t.key
                  ? "bg-[var(--color-gold-subtle)] border-[var(--color-gold)] text-[var(--color-gold)]"
                  : "bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-default)]"
              }`}
            >
              <div className="text-left">
                <span className="text-sm font-medium">{t.label}</span>
                <p className="text-xs opacity-70">{t.desc}</p>
              </div>
              {tone === t.key && (
                <span className="w-5 h-5 rounded-full bg-[var(--color-gold)] flex items-center justify-center text-xs text-[#1A1816]">✓</span>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Stripe Connect — 收款设置 */}
      <Card padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-4 h-4 text-[var(--color-text-secondary)]" />
          <h2 className="text-sm font-heading font-semibold">Payouts</h2>
        </div>
        <PayoutSection />
      </Card>

      {/* Billing */}
      <SubscriptionSection />

      {/* Danger Zone */}
      <Card padding="lg" className="!border-red-900/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-400">Delete account</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Permanently delete all data
            </p>
          </div>
          <Button variant="danger" size="sm">
            Delete
          </Button>
        </div>
      </Card>
    </div>
  );
}

/** 订阅管理组件 */
function SubscriptionSection() {
  const [info, setInfo] = useState<{
    plan?: string;
    trial_ends_at?: string;
    subscription_status?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        setInfo(d);
        setLoading(false);
      });
  }, []);

  const handleManage = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <Card padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-4 h-4 text-[var(--color-text-secondary)]" />
          <h2 className="text-sm font-heading font-semibold">Subscription</h2>
        </div>
        <div className="h-8 animate-shimmer rounded-lg bg-[var(--color-bg-elevated)]" />
      </Card>
    );
  }

  const trialEndDate = info?.trial_ends_at ? new Date(info.trial_ends_at) : null;
  const daysLeft = trialEndDate
    ? Math.ceil((trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;
  const trialActive = daysLeft > 0;
  const isActive = info?.subscription_status &&
    ["trialing", "active", "past_due"].includes(info.subscription_status);

  return (
    <Card padding="lg">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="w-4 h-4 text-[var(--color-text-secondary)]" />
        <h2 className="text-sm font-heading font-semibold">Subscription</h2>
      </div>

      {isActive ? (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-400">
              {info?.plan === "pro" ? "Pro" : "Standard"} Plan — {info?.plan === "pro" ? "$35" : "$19"}/month
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              {info?.subscription_status === "trialing" ? "Trial active" :
               info?.subscription_status === "past_due" ? "Payment past due" : "Active"}
            </p>
          </div>
          <Button variant="secondary" size="sm" loading={portalLoading} onClick={handleManage}>
            Manage
          </Button>
        </div>
      ) : trialActive ? (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Free Trial</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              {daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining
            </p>
          </div>
          <a href="/subscribe?plan=standard">
            <Button variant="gold" size="sm">Upgrade</Button>
          </a>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--color-error)]">Trial expired</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Subscribe to continue using all features
            </p>
          </div>
          <a href="/subscribe?plan=standard">
            <Button variant="gold" size="sm">Subscribe</Button>
          </a>
        </div>
      )}
    </Card>
  );
}

/** Stripe Connect 收款设置组件 */
function PayoutSection() {
  const [status, setStatus] = useState<{ connected?: boolean; charges_enabled?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stripe/connect/status")
      .then((r) => r.json())
      .then((d) => {
        setStatus(d);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="h-8 animate-shimmer rounded-lg bg-[var(--color-bg-elevated)]" />;
  }

  if (status?.charges_enabled) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-green-400 font-medium">✓ Connected</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Payments go directly to your bank account.</p>
        </div>
      </div>
    );
  }

  if (status?.connected) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-amber-400 font-medium">Setup incomplete</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Complete your Stripe onboarding to receive payments.</p>
        </div>
        <Button variant="gold" size="sm" onClick={() => window.location.href = "/api/stripe/connect"}>Complete setup</Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-[var(--color-text-secondary)]">Not set up yet</p>
        <p className="text-xs text-[var(--color-text-disabled)]">Connect Stripe to receive payments directly to your bank.</p>
      </div>
      <Button variant="gold" size="sm" onClick={() => window.location.href = "/api/stripe/connect"}>Set up payouts</Button>
    </div>
  );
}

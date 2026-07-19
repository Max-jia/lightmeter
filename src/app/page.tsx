import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Mail,
  LinkIcon,
  Users,
  Sparkles,
  Check,
  Camera,
  CalendarDays,
  BarChart3,
  ArrowRight,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#1A1816] text-[#F5F0EB]">
      {/* ===== Nav ===== */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-amber)] flex items-center justify-center shadow-[0_0_20px_var(--color-gold-glow)]">
            <Camera className="w-4 h-4 text-[#1A1816]" />
          </div>
          <span className="text-lg font-heading font-semibold tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Darkroom
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
            Sign in
          </Link>
          <Link href="/signup">
            <Button variant="gold" size="sm">Start free trial</Button>
          </Link>
        </div>
      </nav>

      {/* ===== Hero ===== */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center relative">
        {/* Ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[var(--color-gold-glow)] blur-3xl opacity-20 pointer-events-none" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-[var(--color-text-secondary)] mb-8">
            <Sparkles className="w-4 h-4 text-[var(--color-gold)]" />
            AI-powered CRM for photographers
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold tracking-tight leading-[1.1]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Your clients,
            <br />
            <span className="text-[var(--color-gold)]">on autopilot.</span>
          </h1>

          <p className="mt-6 text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Darkroom connects to your Gmail, reads inquiries, and drafts replies — while you shoot.
            One link handles proposals, contracts, and payments. Beautiful analytics tell you how your business is doing.
          </p>

          <div className="mt-10 flex items-center justify-center gap-3">
            <Link href="/signup">
              <Button variant="gold" size="lg">
                Start free trial
                <span className="ml-2 text-xs opacity-70">14 days free</span>
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">
                Sign in
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-[var(--color-text-disabled)]">
            No credit card required · Cancel anytime
          </p>
        </div>
      </section>

      {/* ===== Bento Product Showcase ===== */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Feature 1 — spans 1 */}
          <div className="p-6 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-[var(--elevation-1)] md:col-span-1">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-gold-subtle)] flex items-center justify-center mb-4">
              <Mail className="w-5 h-5 text-[var(--color-gold)]" />
            </div>
            <h3 className="text-base font-heading font-semibold mb-2" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              AI Inbox
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              AI reads inquiries, extracts names, dates and budgets, then drafts replies in your voice. Review and send with one click.
            </p>
          </div>

          {/* Feature 2 — spans 2 */}
          <div className="p-6 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-[var(--elevation-1)] md:col-span-2 flex flex-col justify-center bg-gradient-to-br from-[var(--color-bg-surface)] to-[var(--color-gold-subtle)]">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-gold-subtle)] flex items-center justify-center mb-4">
              <LinkIcon className="w-5 h-5 text-[var(--color-gold)]" />
            </div>
            <h3 className="text-base font-heading font-semibold mb-2" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              One-Link Checkout
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-md">
              One link = proposal + contract (e-sign) + payment. Client opens it, signs, pays. You get notified. No more chasing emails.
            </p>
          </div>

          {/* Feature 3 — spans 2 */}
          <div className="p-6 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-[var(--elevation-1)] md:col-span-2">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-gold-subtle)] flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5 text-[var(--color-gold)]" />
            </div>
            <h3 className="text-base font-heading font-semibold mb-2" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Analytics & Calendar
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-md">
              See your revenue, booking trends, and inquiry sources at a glance. Calendar keeps track of every shoot and payment deadline.
            </p>
          </div>

          {/* Feature 4 — spans 1 */}
          <div className="p-6 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-[var(--elevation-1)] md:col-span-1 bg-gradient-to-br from-[var(--color-gold-subtle)] to-[var(--color-bg-surface)] flex flex-col justify-center">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-gold)]/20 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-[var(--color-gold)]" />
            </div>
            <h3 className="text-base font-heading font-semibold mb-2" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Avg. reply: 14m
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              4x faster than manual. Photographers using Darkroom respond in under 15 minutes.
            </p>
          </div>
        </div>
      </section>

      {/* ===== Comparison ===== */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-heading font-semibold text-center mb-8" style={{ fontFamily: "var(--font-space-grotesk)" }}>
          How we compare
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] shadow-[var(--elevation-1)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-subtle)]">
                <th className="text-left py-3.5 px-5 text-[var(--color-text-secondary)] font-normal">Feature</th>
                <th className="text-center py-3.5 px-5 font-heading font-semibold text-[var(--color-gold)]">Darkroom</th>
                <th className="text-center py-3.5 px-5 text-[var(--color-text-disabled)] font-normal">HoneyBook</th>
                <th className="text-center py-3.5 px-5 text-[var(--color-text-disabled)] font-normal">Dubsado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {[
                ["AI auto-reply drafts", true, false, false],
                ["Client info auto-extraction", true, false, false],
                ["Dashboard + Analytics", true, false, false],
                ["Built-in client gallery", "Soon", true, false],
                ["Calendar scheduling", true, false, false],
                ["One-link proposal+contract+pay", true, true, true],
                ["Global availability", true, false, true],
                ["Flat pricing, no surprise fees", true, false, true],
                ["Starting price", "$19/mo", "$29/mo", "$28/mo"],
              ].map(([feature, dr, hb, dub], i) => (
                <tr key={i} className="hover:bg-[var(--color-bg-elevated)] transition-colors">
                  <td className="py-3 px-5 text-[var(--color-text-secondary)]">{feature}</td>
                  {[dr, hb, dub].map((val, j) => (
                    <td key={j} className="py-3 px-5 text-center">
                      {typeof val === "boolean" ? (
                        val ? <Check className="w-4 h-4 text-[var(--color-gold)] mx-auto" /> : <span className="text-[var(--color-text-disabled)]">—</span>
                      ) : (
                        <span className={j === 0 ? "text-[var(--color-text-secondary)] font-medium" : "text-[var(--color-text-disabled)]"}>
                          {val}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===== Pricing ===== */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-heading font-semibold text-center mb-8" style={{ fontFamily: "var(--font-space-grotesk)" }}>
          Simple pricing
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Standard */}
          <div className="flex flex-col p-6 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-[var(--elevation-1)]">
            <div className="flex-1">
              <p className="text-sm font-heading font-semibold mb-2">Standard</p>
              <p className="text-3xl font-heading font-bold mb-4">
                $19<span className="text-sm text-[var(--color-text-secondary)]">/mo</span>
              </p>
              <ul className="space-y-2.5 text-sm text-[var(--color-text-secondary)]">
                {["AI Inbox (100 replies/mo)", "One-Link proposals & contracts", "Dashboard & Analytics", "Calendar", "Stripe payments"].map((item) => (
                  <li key={item} className="flex items-center gap-2"><Check className="w-4 h-4 text-[var(--color-gold)] flex-shrink-0" />{item}</li>
                ))}
              </ul>
            </div>
            <Link href="/signup?plan=standard"><Button className="w-full mt-6" variant="secondary" size="md">Start free trial</Button></Link>
          </div>
          {/* Pro */}
          <div className="flex flex-col p-6 rounded-2xl bg-gradient-to-br from-[var(--color-gold-subtle)] to-[var(--color-bg-surface)] border border-[var(--color-gold)]/20 shadow-[var(--elevation-2)] relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[var(--color-gold)] text-[#1A1816] text-xs font-semibold">Most popular</div>
            <div className="flex-1">
              <p className="text-sm font-heading font-semibold mb-2">Pro</p>
              <p className="text-3xl font-heading font-bold mb-4">
                $35<span className="text-sm text-[var(--color-text-secondary)]">/mo</span>
              </p>
              <ul className="space-y-2.5 text-sm text-[var(--color-text-secondary)]">
                {["Unlimited AI replies", "Everything in Standard", "Multi-brand support", "Priority support"].map((item) => (
                  <li key={item} className="flex items-center gap-2"><Check className="w-4 h-4 text-[var(--color-gold)] flex-shrink-0" />{item}</li>
                ))}
              </ul>
            </div>
            <Link href="/signup?plan=pro"><Button className="w-full mt-6" variant="gold" size="md">Start free trial</Button></Link>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-[var(--color-border-subtle)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[var(--color-gold)]/20 flex items-center justify-center">
              <Camera className="w-3 h-3 text-[var(--color-gold)]" />
            </div>
            <span className="text-sm font-heading font-semibold">Darkroom</span>
          </div>
          <p className="text-xs text-[var(--color-text-disabled)]">
            © 2026 Darkroom. AI CRM for photographers.
          </p>
        </div>
      </footer>
    </div>
  );
}

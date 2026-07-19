import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/misc";
import {
  DollarSign,
  TrendingUp,
  Users,
  CalendarDays,
  Mail,
  ArrowUpRight,
} from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Analytics
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Your business at a glance.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {["7d", "30d", "90d", "1y"].map((range) => (
            <button
              key={range}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                range === "30d"
                  ? "bg-[var(--color-gold)] text-[#1A1816]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)]"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard label="Total Revenue" value="$47,250" change={22} changeLabel="vs prev. period" icon={DollarSign} />
        <StatCard label="Bookings" value="24" change={14} changeLabel="vs prev. period" icon={CalendarDays} />
        <StatCard label="Inquiry → Booking" value="38%" change={5} changeLabel="conversion rate" icon={TrendingUp} />
        <StatCard label="Avg. Booking Value" value="$1,970" change={8} changeLabel="vs prev. period" icon={Users} />
      </div>

      {/* Revenue Chart (visual placeholder) */}
      <Card depth={2} padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-heading font-semibold" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Revenue Overview
          </h2>
          <span className="text-xs text-[var(--color-gold)] cursor-pointer hover:underline">
            Export CSV
          </span>
        </div>
        {/* Bar chart visual */}
        <div className="flex items-end gap-3 h-40">
          {[2800, 4200, 3100, 5600, 3800, 7200, 5100, 4400, 6200, 3500, 4800, 5900].map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full rounded-t-lg bg-[var(--color-gold)]/80 hover:bg-[var(--color-gold)] transition-colors cursor-pointer"
                style={{ height: `${(val / 8000) * 140}px` }}
              />
              <span className="text-[10px] text-[var(--color-text-disabled)]">
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i]}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Inquiry Sources + Top Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card depth={2} padding="lg">
          <h2 className="text-sm font-heading font-semibold mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Inquiry Sources
          </h2>
          {[
            { source: "Instagram", pct: 42, color: "var(--color-gold)" },
            { source: "Google Search", pct: 28, color: "var(--color-amber)" },
            { source: "Referrals", pct: 18, color: "var(--color-text-secondary)" },
            { source: "The Knot / WeddingWire", pct: 12, color: "var(--color-text-disabled)" },
          ].map((item) => (
            <div key={item.source} className="flex items-center gap-3 mb-3 last:mb-0">
              <span className="text-sm flex-1">{item.source}</span>
              <div className="w-32 h-2 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${item.pct}%`, background: item.color }}
                />
              </div>
              <span className="text-sm text-[var(--color-text-secondary)] w-10 text-right font-medium">
                {item.pct}%
              </span>
            </div>
          ))}
        </Card>

        <Card depth={2} padding="lg">
          <h2 className="text-sm font-heading font-semibold mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Top Clients by Revenue
          </h2>
          {[
            { name: "Sarah & Michael Johnson", revenue: "$5,200" },
            { name: "David & Lisa Park", revenue: "$4,800" },
            { name: "Mike & Jenny Chen", revenue: "$4,200" },
            { name: "Olivia Kim", revenue: "$1,500" },
          ].map((c, i) => (
            <div key={c.name} className="flex items-center justify-between py-2 border-b border-[var(--color-border-subtle)] last:border-none">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-[var(--color-text-disabled)] w-5">{i + 1}</span>
                <span className="text-sm">{c.name}</span>
              </div>
              <span className="text-sm font-semibold">{c.revenue}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

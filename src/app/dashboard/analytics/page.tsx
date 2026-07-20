"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/misc";
import { DollarSign, Users, CalendarDays, TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((d) => {
        setStats(d);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-24 animate-shimmer rounded-xl bg-[var(--color-bg-surface)]" />)}</div>;
  }

  const hasData = stats && (stats.totalClients > 0 || (stats.monthlyRevenue && stats.monthlyRevenue !== "$0"));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-heading font-semibold tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>Analytics</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Your business at a glance.</p>
      </div>

      {!hasData ? (
        <Card padding="lg" className="text-center py-12 space-y-3">
          <p className="text-sm text-[var(--color-text-secondary)]">No data yet. Start receiving inquiries and closing bookings to see your analytics.</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Monthly Revenue" value={stats.monthlyRevenue || "$0"} icon={DollarSign} />
            <StatCard label="Total Clients" value={String(stats.totalClients || 0)} icon={Users} />
            <StatCard label="Active Clients" value={String(stats.activeClients || 0)} icon={CalendarDays} />
            <StatCard label="Drafts Ready" value={String(stats.draftsReady || 0)} icon={TrendingUp} />
          </div>
        </>
      )}
    </div>
  );
}

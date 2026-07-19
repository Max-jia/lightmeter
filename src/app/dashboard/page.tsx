import { Card } from "@/components/ui/card";
import { StatCard, InsightCard, Badge } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/misc";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";
import {
  DollarSign,
  CalendarDays,
  Mail,
  Users,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Plus,
  BarChart3,
  LinkIcon,
} from "lucide-react";

export default async function DashboardHome() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) redirect("/login");
  } catch {
    // Supabase 未配置，展示演示数据
  }

  const upcomingShoots = [
    { client: "Sarah Johnson", type: "Wedding", date: "Oct 24, 2026", daysLeft: 7 },
    { client: "Mike Chen", type: "Wedding", date: "Nov 15, 2026", daysLeft: 28 },
    { client: "Olivia Kim", type: "Engagement", date: "Sep 15, 2026", daysLeft: 2 },
  ];

  const recentInquiries = [
    { name: "Rachel Park", type: "Wedding", date: "2h ago", budget: "$5,000" },
    { name: "Thomas Lee", type: "Portrait", date: "5h ago", budget: "$800" },
    { name: "Amanda & Chris", type: "Wedding", date: "1d ago", budget: "$4,200" },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Good morning, Jane
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            You have 3 drafts ready and 2 shoots this week.
          </p>
        </div>
        <Link href="/dashboard/inbox">
          <Button variant="gold" size="md">
            <Plus className="w-4 h-4 mr-2" />
            New Proposal
          </Button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard label="Monthly Revenue" value="$12,450" change={18} changeLabel="vs last month" icon={DollarSign} />
        <StatCard label="Active Clients" value="8" change={12} changeLabel="vs last month" icon={Users} />
        <StatCard label="Inquiries This Week" value="12" change={-5} changeLabel="vs last week" icon={Mail} />
        <StatCard label="Avg. Response Time" value="14m" change={23} changeLabel="faster" icon={TrendingUp} />
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Upcoming Shoots (spans 2) */}
        <Card depth={2} padding="lg" className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-heading font-semibold flex items-center gap-2" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              <CalendarDays className="w-4 h-4 text-[var(--color-gold)]" />
              Upcoming Shoots
            </h2>
            <Link href="/dashboard/calendar" className="text-xs text-[var(--color-gold)] hover:underline">
              View calendar →
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingShoots.map((shoot) => (
              <div key={shoot.client} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
                <div className="flex items-center gap-3">
                  <Avatar name={shoot.client} size="sm" />
                  <div>
                    <p className="text-sm font-medium">{shoot.client}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {shoot.type} · {shoot.date}
                    </p>
                  </div>
                </div>
                <Badge variant={shoot.daysLeft <= 3 ? "warning" : "default"}>
                  {shoot.daysLeft}d left
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Insight */}
        <InsightCard
          title="AI Insight"
          description="Sarah Johnson's wedding is in 7 days. She hasn't confirmed the timeline yet. Send a quick check-in?"
        />
      </div>

      {/* Recent inquiries + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Inquiries (spans 2) */}
        <Card depth={2} padding="lg" className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-heading font-semibold flex items-center gap-2" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              <Mail className="w-4 h-4 text-[var(--color-gold)]" />
              Recent Inquiries
            </h2>
            <Link href="/dashboard/inbox" className="text-xs text-[var(--color-gold)] hover:underline">
              Open inbox →
            </Link>
          </div>
          <div className="space-y-2">
            {recentInquiries.map((inq) => (
              <div key={inq.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <Avatar name={inq.name} size="sm" />
                  <div>
                    <p className="text-sm font-medium">{inq.name}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {inq.type} · {inq.budget}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-[var(--color-text-disabled)]">{inq.date}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card depth={2} padding="lg">
          <h2 className="text-sm font-heading font-semibold mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Quick Actions
          </h2>
          <div className="space-y-2">
            {[
              { label: "Create proposal link", icon: LinkIcon, href: "/dashboard/links" },
              { label: "Add new client", icon: Users, href: "/dashboard/clients" },
              { label: "Check inbox", icon: Mail, href: "/dashboard/inbox" },
              { label: "View analytics", icon: BarChart3, href: "/dashboard/analytics" },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-xl text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-all duration-[var(--duration-fast)] group"
              >
                <action.icon className="w-4 h-4 text-[var(--color-text-disabled)] group-hover:text-[var(--color-gold)] transition-colors" />
                {action.label}
                <ArrowRight className="w-4 h-4 ml-auto text-[var(--color-text-disabled)] opacity-0 group-hover:opacity-100 transition-all" />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

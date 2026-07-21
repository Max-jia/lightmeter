import { Card } from "@/components/ui/card";
import { StatCard, InsightCard } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  DollarSign,
  CalendarDays,
  Mail,
  Users,
  Plus,
  BarChart3,
  LinkIcon,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  let user: any = null;
  let stats: any = null;
  let upcomingClients: any[] = [];
  let recentEmails: any[] = [];
  let supabaseConfigured = false;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) redirect("/login");
    user = data.user;
    supabaseConfigured = true;

    // 查询真实数据
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [clientsRes, emailsRes, paymentsRes] = await Promise.all([
      supabase.from("clients").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
      supabase.from("emails").select("*").eq("user_id", user.id).eq("status", "draft_ready").order("received_at", { ascending: false }).limit(5),
      supabase.from("payments").select("amount").eq("user_id", user.id).eq("status", "completed").gte("paid_at", monthStart),
    ]);

    const allClients = clientsRes.data || [];
    upcomingClients = allClients
      .filter((c: any) => c.event_date && c.event_date >= now.toISOString().split("T")[0])
      .sort((a: any, b: any) => a.event_date.localeCompare(b.event_date))
      .slice(0, 5);

    const allEmails = emailsRes.data || [];
    recentEmails = allEmails.slice(0, 5);

    const monthlyRevenue = paymentsRes.data?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;
    const totalClients = allClients.length;
    const activeClients = allClients.filter((c: any) => c.status === "active" || c.status === "lead").length;
    const draftsReady = allEmails.length;

    stats = {
      monthlyRevenue: monthlyRevenue > 0 ? `$${(monthlyRevenue / 100).toLocaleString()}` : "$0",
      totalClients,
      activeClients,
      draftsReady,
      hasData: totalClients > 0 || draftsReady > 0 || allClients.length > 0,
    };
  } catch {
    // Supabase 未配置
  }

  const displayName = user?.user_metadata?.full_name || "there";

  // 新用户空状态
  if (supabaseConfigured && !stats?.hasData) {
    return (
      <div className="space-y-8 animate-fade-in-up max-w-2xl mx-auto py-16 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--color-gold-subtle)] flex items-center justify-center mb-6">
          <Sparkles className="w-8 h-8 text-[var(--color-gold)]" />
        </div>
        <h1 className="text-2xl font-heading font-semibold">Welcome to Lightmeter{displayName ? `, ${displayName.split(" ")[0]}` : ""}!</h1>
        <p className="text-sm text-[var(--color-text-secondary)] max-w-md mx-auto leading-relaxed">
          Your AI-powered photography CRM is ready. Here&apos;s how to get started:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {[
            { step: "1", title: "Connect Gmail", desc: "AI will auto-reply to client inquiries", href: "/dashboard/inbox" },
            { step: "2", title: "Create a link", desc: "Send proposals with contracts & payments", href: "/dashboard/links" },
            { step: "3", title: "See the calendar", desc: "Track shoots and payment deadlines", href: "/dashboard/calendar" },
          ].map((item) => (
            <Link key={item.step} href={item.href}>
              <Card depth={1} padding="lg" className="text-center h-full hover:border-[var(--color-gold)]/40 transition-colors">
                <div className="w-8 h-8 mx-auto rounded-lg bg-[var(--color-gold)]/20 flex items-center justify-center mb-3 text-sm font-bold text-[var(--color-gold)]">
                  {item.step}
                </div>
                <h3 className="text-sm font-heading font-semibold mb-1">{item.title}</h3>
                <p className="text-xs text-[var(--color-text-secondary)]">{item.desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Good morning{displayName ? `, ${displayName.split(" ")[0]}` : ""}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {stats?.draftsReady > 0
              ? `You have ${stats.draftsReady} drafts ready.`
              : "Connect your Gmail to get started."}
          </p>
        </div>
        <Link href="/dashboard/inbox">
          <Button variant="gold" size="md">
            <Plus className="w-4 h-4 mr-2" />
            New Proposal
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard label="Monthly Revenue" value={stats?.monthlyRevenue || "$0"} icon={DollarSign} />
        <StatCard label="Total Clients" value={String(stats?.totalClients || 0)} icon={Users} />
        <StatCard label="Active Leads" value={String(stats?.activeClients || 0)} icon={Mail} />
        <StatCard label="Drafts Ready" value={String(stats?.draftsReady || 0)} icon={Sparkles} />
      </div>

      {/* Upcoming shoots */}
      <Card depth={2} padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-heading font-semibold flex items-center gap-2" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            <CalendarDays className="w-4 h-4 text-[var(--color-gold)]" />
            Upcoming Shoots
          </h2>
          <Link href="/dashboard/calendar" className="text-xs text-[var(--color-gold)] hover:underline">
            View calendar →
          </Link>
        </div>
        {upcomingClients.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)] py-4 text-center">
            No upcoming shoots yet. Add a client with an event date to see them here.
          </p>
        ) : (
          <div className="space-y-2">
            {upcomingClients.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-elevated)]">
                <span className="text-sm font-medium">{c.name}</span>
                <span className="text-xs text-[var(--color-text-secondary)]">
                  {c.event_type} · {c.event_date}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card depth={2} padding="lg">
        <h2 className="text-sm font-heading font-semibold mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: "Create proposal link", icon: LinkIcon, href: "/dashboard/links" },
            { label: "Add new client", icon: Users, href: "/dashboard/clients" },
            { label: "Check inbox", icon: Mail, href: "/dashboard/inbox" },
            { label: "View analytics", icon: BarChart3, href: "/dashboard/analytics" },
          ].map((action) => (
            <Link key={action.label} href={action.href} className="flex items-center gap-2 p-3 rounded-xl text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-all group">
              <action.icon className="w-4 h-4 text-[var(--color-text-disabled)] group-hover:text-[var(--color-gold)] transition-colors" />
              {action.label}
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}

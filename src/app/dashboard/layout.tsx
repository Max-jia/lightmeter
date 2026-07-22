import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user: any = null;
  let trialEndsAt: string | null = null;
  let subscriptionStatus: string | null = null;
  let displayName: string | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("trial_ends_at, subscription_status, full_name")
        .eq("id", user.id)
        .single();
      trialEndsAt = profile?.trial_ends_at || null;
      subscriptionStatus = profile?.subscription_status || null;
      displayName = profile?.full_name || user.user_metadata?.full_name || null;
    }
  } catch {
    // Supabase 未配置 → 显示设置引导
    return (
      <div className="flex h-screen overflow-hidden bg-[var(--color-bg-base)]">
        <Sidebar userEmail="photographer@email.com" userName="Photographer" />
        <main className="flex-1 overflow-y-auto flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md px-6">
            <h2 className="text-xl font-heading font-semibold">Setup Required</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Supabase is not configured yet. Add your Supabase project URL and anon key to <code className="px-1.5 py-0.5 rounded bg-[var(--color-bg-overlay)] text-[var(--color-gold)]">.env.local</code>, then restart the dev server.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    redirect("/login");
  }

  // 计算试用剩余天数
  const trialEndDate = trialEndsAt ? new Date(trialEndsAt) : null;
  const daysLeft = trialEndDate
    ? Math.ceil((trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;
  const trialActive = daysLeft > 0;
  const hasSubscription = subscriptionStatus &&
    ["trialing", "active", "past_due"].includes(subscriptionStatus);

  const showTrialBanner = trialActive && !hasSubscription;
  const showExpiredBanner = !trialActive && !hasSubscription && daysLeft <= 0 && trialEndDate;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar userEmail={user.email} userName={displayName} />
      <main className="flex-1 overflow-y-auto">
        {/* Trial banner */}
        {showTrialBanner && (
          <div className="sticky top-0 z-30 px-4 py-2.5 bg-[var(--color-gold-subtle)] border-b border-[var(--color-gold)]/20 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              <span className="font-semibold text-[var(--color-gold)]">{daysLeft} day{daysLeft !== 1 ? "s" : ""} left</span> in your free trial.{" "}
              <a href={`/subscribe?plan=standard`} className="text-[var(--color-gold)] hover:underline font-medium">
                Upgrade now →
              </a>
            </p>
          </div>
        )}
        {showExpiredBanner && (
          <div className="sticky top-0 z-30 px-4 py-2.5 bg-[var(--color-error-bg)] border-b border-[var(--color-error)]/20 text-center">
            <p className="text-sm text-[var(--color-error)]">
              Your free trial has ended.{" "}
              <a href="/subscribe?plan=standard" className="text-[var(--color-gold)] hover:underline font-medium">
                Subscribe now →
              </a>
            </p>
          </div>
        )}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</div>
      </main>
    </div>
  );
}

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

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
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

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar userEmail={user.email} userName={user.user_metadata?.full_name} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</div>
      </main>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";
import { NextResponse } from "next/server";

/**
 * 创建 Stripe Customer Portal Session
 * 用户可以在 Stripe 托管的页面里管理订阅：升级、降级、取消、更新付款方式
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", userData.user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: "No subscription found" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get("origin") || "";

  try {
    const portalSession = await stripe().billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${baseUrl}/dashboard/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err: any) {
    console.error("Portal session error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

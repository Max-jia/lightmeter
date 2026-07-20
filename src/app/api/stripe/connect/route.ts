import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";
import { NextResponse } from "next/server";

/**
 * GET /api/stripe/connect
 * 为摄影师创建 Stripe Connect 入驻链接
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

  try {
    // 检查是否已有 connected account
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_account_id, full_name, id")
      .eq("id", userData.user.id)
      .single();

    let accountId = profile?.stripe_account_id;

    if (!accountId) {
      // 创建新的 Stripe Connect 账户
      const account = await stripe().accounts.create({
        type: "standard",
        country: "US",
        email: userData.user.email,
        metadata: { user_id: userData.user.id },
      });
      accountId = account.id;

      await supabase
        .from("profiles")
        .update({ stripe_account_id: accountId })
        .eq("id", userData.user.id);
    }

    // 创建入驻链接
    const accountLink = await stripe().accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}/api/stripe/connect`,
      return_url: `${baseUrl}/api/stripe/connect/return`,
      type: "account_onboarding",
    });

    return NextResponse.redirect(accountLink.url);
  } catch (err: any) {
    console.error("Stripe Connect error:", err);
    return NextResponse.redirect(
      new URL(`/dashboard/settings?connect_error=${encodeURIComponent(err.message)}`, baseUrl),
      303
    );
  }
}

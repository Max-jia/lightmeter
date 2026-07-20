import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";
import { NextResponse } from "next/server";

/**
 * GET /api/stripe/connect/return
 * 摄影师完成 Stripe Connect 入驻后回到这里
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_account_id")
      .eq("id", userData.user.id)
      .single();

    if (profile?.stripe_account_id) {
      // 检查入驻是否完成
      const account = await stripe().accounts.retrieve(profile.stripe_account_id);
      if (!account.charges_enabled) {
        return NextResponse.redirect(
          new URL("/dashboard/settings?connect_error=onboarding_incomplete", baseUrl),
          303
        );
      }
    }

    return NextResponse.redirect(
      new URL("/dashboard/settings?connect=success", baseUrl),
      303
    );
  } catch (err: any) {
    console.error("Connect return error:", err);
    return NextResponse.redirect(
      new URL(`/dashboard/settings?connect_error=${encodeURIComponent(err.message)}`, baseUrl),
      303
    );
  }
}

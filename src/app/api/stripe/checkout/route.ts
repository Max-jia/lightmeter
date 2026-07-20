import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";
import { NextResponse } from "next/server";

/**
 * 创建 Stripe Checkout Session
 * POST /api/stripe/checkout — body: { linkId?, amount, description }
 *
 * 两种场景：
 * 1. 客户端打开付款链接（公开） — 钱到摄影师的 Stripe Connect 账户
 * 2. 用户订阅付费墙（需登录） — 钱到平台 Stripe 账户
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const { linkId, amount, description } = body;

  if (!amount || !description) {
    return NextResponse.json({ error: "amount and description required" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get("origin") || "";

  try {
    // 场景 1：客户端通过链接付款 → 钱进摄影师账户
    if (linkId) {
      const { data: link } = await supabase
        .from("links")
        .select("user_id, proposal_amount, proposal_title")
        .eq("id", linkId)
        .single();

      if (!link) {
        return NextResponse.json({ error: "Link not found" }, { status: 404 });
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_account_id")
        .eq("id", link.user_id)
        .single();

      if (!profile?.stripe_account_id) {
        return NextResponse.json({ error: "Photographer has not set up payments yet" }, { status: 400 });
      }

      // 在摄影师的 Connect 账户上创建 Checkout
      const session = await stripe().checkout.sessions.create(
        {
          payment_method_types: ["card"],
          line_items: [{ price_data: { currency: "usd", product_data: { name: description }, unit_amount: amount }, quantity: 1 }],
          mode: "payment",
          metadata: { link_id: linkId, photographer_id: link.user_id },
          success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${baseUrl}/payment/cancelled`,
        },
        { stripeAccount: profile.stripe_account_id }
      );

      await supabase.from("links").update({ stripe_session_id: session.id, updated_at: new Date().toISOString() }).eq("id", linkId);

      return NextResponse.json({ url: session.url });
    }

    // 场景 2：订阅付费 → 钱进平台账户
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const session = await stripe().checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price_data: { currency: "usd", product_data: { name: description }, unit_amount: amount }, quantity: 1 }],
      mode: "payment",
      customer_email: userData.user.email,
      metadata: { photographer_id: userData.user.id },
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payment/cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: err.message || "Stripe error" }, { status: 500 });
  }
}

import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";
import { NextResponse } from "next/server";

/**
 * 创建 Stripe Checkout Session
 * POST /api/stripe/checkout
 *
 * 三种场景：
 * 1. 客户端通过链接付款（公开）— 钱进摄影师 Stripe Connect 账户
 * 2. 用户订阅付费（需登录）— mode: subscription + 14天试用
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const { linkId, amount, description, plan } = body;

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

    // 场景 2：订阅（plan=standard|pro）
    if (plan) {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }

      const priceId = plan === "pro"
        ? process.env.STRIPE_PRO_PRICE_ID
        : process.env.STRIPE_STANDARD_PRICE_ID;

      if (!priceId) {
        return NextResponse.json({ error: "Price not configured" }, { status: 500 });
      }

      // 查找或创建 Stripe Customer
      const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_customer_id")
        .eq("id", userData.user.id)
        .single();

      let customerId = profile?.stripe_customer_id;

      if (!customerId) {
        const customer = await stripe().customers.create({
          email: userData.user.email,
          metadata: { user_id: userData.user.id },
        });
        customerId = customer.id;
        await supabase
          .from("profiles")
          .update({ stripe_customer_id: customerId })
          .eq("id", userData.user.id);
      }

      // 计算剩余试用天数（如果用户还没过期）
      let trialDays: number | undefined = 14;
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("trial_ends_at, subscription_status")
        .eq("id", userData.user.id)
        .single();

      if (currentProfile?.trial_ends_at) {
        const remaining = Math.ceil(
          (new Date(currentProfile.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        // 如果试用已过期，不设 trial；否则设为剩余天数（最少1天）
        if (remaining <= 0) {
          trialDays = undefined;
        } else {
          trialDays = Math.max(1, remaining);
        }
      }

      // 创建订阅 Checkout
      const sessionParams: any = {
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        customer: customerId,
        metadata: { user_id: userData.user.id },
        success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/subscribe?plan=${plan}`,
        subscription_data: {},
      };

      // 如果还在试用期内，设置试用
      if (trialDays) {
        sessionParams.subscription_data.trial_period_days = trialDays;
      }

      const session = await stripe().checkout.sessions.create(sessionParams);

      return NextResponse.json({ url: session.url });
    }

    // 场景 3：旧的客户端付款（需登录，保留兼容）
    if (amount && description) {
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
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: err.message || "Stripe error" }, { status: 500 });
  }
}

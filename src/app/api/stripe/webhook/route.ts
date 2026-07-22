import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";
import { NextResponse } from "next/server";
import Stripe from "stripe";

/**
 * Stripe Webhook
 * 处理付款成功 + 订阅生命周期事件
 */
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createClient();

  // ── 订阅创建成功 ──
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // 只处理订阅模式的 checkout
    if (session.mode === "subscription" && session.metadata?.user_id) {
      const userId = session.metadata.user_id;
      const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

      if (subscriptionId) {
        await supabase
          .from("profiles")
          .update({
            stripe_subscription_id: subscriptionId,
            subscription_status: "active",
          })
          .eq("id", userId);
      }
    }

    // 客户端付款（非订阅）的处理
    const photographerId = session.metadata?.photographer_id;
    const linkId = session.metadata?.link_id;

    if (photographerId && session.amount_total && session.mode !== "subscription") {
      let clientId = null;
      if (linkId) {
        const { data: link } = await supabase.from("links").select("client_id").eq("id", linkId).single();
        clientId = link?.client_id || null;
      }

      await supabase.from("payments").insert({
        user_id: photographerId,
        client_id: clientId,
        link_id: linkId || null,
        stripe_session_id: session.id,
        stripe_payment_intent_id:
          typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || null,
        amount: session.amount_total,
        currency: session.currency || "usd",
        status: "completed",
        description: session.metadata?.description || "Payment",
        paid_at: new Date().toISOString(),
      });

      if (linkId) {
        await supabase.from("links").update({ status: "paid", updated_at: new Date().toISOString() }).eq("id", linkId);
      }
    }
  }

  // ── 订阅状态更新（续费成功/失败/取消等） ──
  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    const userId = subscription.metadata?.user_id;

    if (!userId) {
      // 从 customer metadata 获取
      const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;
      if (customerId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();
        if (profile) {
          await supabase
            .from("profiles")
            .update({ subscription_status: subscription.status })
            .eq("id", profile.id);
        }
      }
    } else {
      await supabase
        .from("profiles")
        .update({ subscription_status: subscription.status })
        .eq("id", userId);
    }
  }

  // ── 订阅删除（用户取消或过期） ──
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;

    if (customerId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();
      if (profile) {
        await supabase
          .from("profiles")
          .update({
            subscription_status: "canceled",
            stripe_subscription_id: null,
          })
          .eq("id", profile.id);
      }
    }
  }

  // 记录 webhook 日志
  await supabase.from("webhook_logs").insert({
    source: "stripe",
    event_type: event.type,
    payload: event as any,
  });

  return NextResponse.json({ received: true });
}

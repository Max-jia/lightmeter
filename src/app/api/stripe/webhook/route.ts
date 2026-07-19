import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";
import { NextResponse } from "next/server";
import Stripe from "stripe";

/**
 * Stripe Webhook
 * 收到付款成功事件 → 创建 payment 记录 → 更新 link 状态
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

  // 创建 supabase 客户端（服务端，不受 RLS 限制）
  const supabase = await createClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const photographerId = session.metadata?.photographer_id;
    const linkId = session.metadata?.link_id;

    if (photographerId && session.amount_total) {
      // 查找客户
      let clientId = null;
      if (linkId) {
        const { data: link } = await supabase
          .from("links")
          .select("client_id")
          .eq("id", linkId)
          .single();
        clientId = link?.client_id || null;
      }

      // 创建支付记录
      await supabase.from("payments").insert({
        user_id: photographerId,
        client_id: clientId,
        link_id: linkId || null,
        stripe_session_id: session.id,
        stripe_payment_intent_id:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id || null,
        amount: session.amount_total,
        currency: session.currency || "usd",
        status: "completed",
        description: session.metadata?.description || "Payment",
        paid_at: new Date().toISOString(),
      });

      // 更新 link 状态
      if (linkId) {
        await supabase
          .from("links")
          .update({ status: "paid", updated_at: new Date().toISOString() })
          .eq("id", linkId);
      }
    }
  }

  // 记录 webhook
  await supabase.from("webhook_logs").insert({
    source: "stripe",
    event_type: event.type,
    payload: event as any,
  });

  return NextResponse.json({ received: true });
}

import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";
import { NextResponse } from "next/server";

/**
 * 创建 Stripe Checkout Session
 * POST /api/stripe/checkout — body: { linkId, amount, description }
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { linkId, amount, description } = await request.json();
  if (!amount || !description) {
    return NextResponse.json({ error: "amount and description required" }, { status: 400 });
  }

  try {
    // 获取 link 的客户邮箱
    let customerEmail = "";
    if (linkId) {
      const { data: link } = await supabase
        .from("links")
        .select("client_id")
        .eq("id", linkId)
        .eq("user_id", userData.user.id)
        .single();

      if (link?.client_id) {
        const { data: client } = await supabase
          .from("clients")
          .select("email")
          .eq("id", link.client_id)
          .single();
        customerEmail = client?.email || "";
      }
    }

    const session = await stripe().checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: description },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: customerEmail || undefined,
      metadata: {
        photographer_id: userData.user.id,
        link_id: linkId || "",
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || request.headers.get("origin")}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || request.headers.get("origin")}/payment/cancelled`,
    });

    // 更新 link 记录
    if (linkId) {
      await supabase
        .from("links")
        .update({ stripe_session_id: session.id, updated_at: new Date().toISOString() })
        .eq("id", linkId);
    }

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: err.message || "Stripe error" }, { status: 500 });
  }
}

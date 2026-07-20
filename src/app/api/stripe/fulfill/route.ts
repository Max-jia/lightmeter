import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * POST /api/stripe/fulfill
 * 支付成功后，更新数据库：link 状态、payment 记录、client 记录
 */
export async function POST(request: Request) {
  const { sessionId } = await request.json();

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    // 查找关联的 link
    const { data: link } = await supabase
      .from("links")
      .select("id, user_id, client_id, proposal_amount, proposal_title, status, stripe_session_id")
      .eq("stripe_session_id", sessionId)
      .single();

    if (!link) {
      return NextResponse.json({ error: "Link not found for this session" }, { status: 404 });
    }

    // 避免重复处理
    if (link.status === "paid") {
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    // 1. 更新 link 状态
    await supabase
      .from("links")
      .update({ status: "paid", updated_at: new Date().toISOString() })
      .eq("id", link.id);

    // 2. 创建 payment 记录
    await supabase.from("payments").insert({
      user_id: link.user_id,
      client_id: link.client_id,
      link_id: link.id,
      stripe_session_id: sessionId,
      amount: link.proposal_amount || 0,
      currency: "usd",
      status: "completed",
      description: link.proposal_title,
      paid_at: new Date().toISOString(),
    });

    // 3. 更新或创建客户记录
    if (link.client_id) {
      await supabase
        .from("clients")
        .update({
          status: "active",
          payment_status: "paid_full",
          updated_at: new Date().toISOString(),
        })
        .eq("id", link.client_id);
    } else {
      // 创建新客户（从链接标题提取名字）
      const clientName = link.proposal_title
        ? link.proposal_title.split(" — ")[0]?.trim() || "New Client"
        : "New Client";

      const { data: newClient } = await supabase
        .from("clients")
        .insert({
          user_id: link.user_id,
          name: clientName,
          status: "active",
          payment_status: "paid_full",
        })
        .select("id")
        .single();

      if (newClient) {
        await supabase.from("links").update({ client_id: newClient.id }).eq("id", link.id);
        // 更新 payment 记录的 client_id
        await supabase
          .from("payments")
          .update({ client_id: newClient.id })
          .eq("link_id", link.id)
          .eq("stripe_session_id", sessionId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Fulfill error:", err);
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}

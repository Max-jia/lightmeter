import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("id");
  if (!clientId) {
    return NextResponse.json({ error: "client id required" }, { status: 400 });
  }

  // 取客户信息
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .eq("user_id", userData.user.id)
    .single();

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  // 并行查询三张表
  const [emailsRes, linksRes, paymentsRes] = await Promise.all([
    supabase.from("emails").select("id, subject, from_address, status, ai_classification, received_at").eq("user_id", userData.user.id).or(client.email ? `client_id.eq.${clientId},from_address.ilike.%${client.email}%` : `client_id.eq.${clientId}`).order("received_at", { ascending: false }).limit(50),
    supabase.from("links").select("id, slug, proposal_title, proposal_amount, status, contract_signed_at, created_at").eq("user_id", userData.user.id).eq("client_id", clientId).order("created_at", { ascending: false }).limit(50),
    supabase.from("payments").select("id, amount, status, description, paid_at, link_id").eq("user_id", userData.user.id).eq("client_id", clientId).eq("status", "completed").order("paid_at", { ascending: false }).limit(50),
  ]);

  const events: any[] = [];

  // 邮件事件
  for (const e of emailsRes.data || []) {
    events.push({
      type: e.status === "sent" ? "email_sent" : "email_received",
      title: e.subject || "(no subject)",
      detail: e.from_address,
      timestamp: e.received_at,
      sub: e.ai_classification === "new_inquiry" ? "📨 New inquiry" : e.status === "sent" ? "📤 Reply sent" : "📧 Email",
    });
  }

  // 提案/链接事件
  for (const l of linksRes.data || []) {
    events.push({
      type: "proposal",
      title: l.proposal_title || "Proposal",
      detail: l.proposal_amount ? `$${(l.proposal_amount / 100).toLocaleString()}` : "",
      timestamp: l.created_at,
      sub: l.contract_signed_at ? "✍️ Contract signed" : l.status === "pending" ? "🔗 Awaiting signature" : `🔗 ${l.status}`,
      link: `/l/${l.slug}`,
    });
  }

  // 付款事件
  for (const p of paymentsRes.data || []) {
    events.push({
      type: "payment",
      id: p.id,
      title: p.description || "Payment",
      detail: p.amount ? `$${(p.amount / 100).toLocaleString()}` : "",
      timestamp: p.paid_at || p.created_at,
      sub: "💰 Paid",
      link: `/api/invoices/${p.id}`,
    });
  }

  // 客户创建事件
  events.push({
    type: "client_created",
    title: "Client added",
    detail: client.name,
    timestamp: client.created_at,
    sub: "👤 Created",
  });

  // 按时间降序排列
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return NextResponse.json({ client, events });
}

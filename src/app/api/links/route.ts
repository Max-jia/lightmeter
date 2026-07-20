import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: links } = await supabase
    .from("links")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json({ links: links || [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { clientName, amount, description } = body;

  if (!clientName || !amount) {
    return NextResponse.json({ error: "Client name and amount are required" }, { status: 400 });
  }

  // 生成 slug
  const slug = `${clientName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;

  const { data: link, error } = await supabase
    .from("links")
    .insert({
      user_id: userData.user.id,
      slug,
      proposal_title: description || `${clientName} — Photography Services`,
      proposal_amount: amount,
      proposal_description: description,
      status: "pending",
    })
    .select("id, slug, proposal_title, proposal_amount, status")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ link });
}

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET: 我的模板列表
export async function GET() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data } = await supabase.from("link_templates").select("*").eq("user_id", userData.user.id).order("created_at", { ascending: false });
  return NextResponse.json({ templates: data || [] });
}

// POST: 保存模板
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { name, proposal_amount, proposal_description, contract_template } = await request.json();
  if (!name) return NextResponse.json({ error: "Template name required" }, { status: 400 });

  const { data, error } = await supabase.from("link_templates").insert({
    user_id: userData.user.id, name, proposal_amount, proposal_description, contract_template,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ template: data });
}

// DELETE: 删除模板
export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await supabase.from("link_templates").delete().eq("id", id).eq("user_id", userData.user.id);
  return NextResponse.json({ success: true });
}

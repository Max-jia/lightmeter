import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return NextResponse.json({ clients: clients || [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { name, email, phone, instagram, event_type, event_date, location, partner_name, budget, referral_source, notes } = body;

  if (!name) {
    return NextResponse.json({ error: "Client name is required" }, { status: 400 });
  }

  const { data: client, error } = await supabase
    .from("clients")
    .insert({
      user_id: userData.user.id,
      name,
      email: email || null,
      phone: phone || null,
      instagram: instagram || null,
      event_type: event_type || "other",
      event_date: event_date || null,
      location: location || null,
      partner_name: partner_name || null,
      budget: budget || null,
      referral_source: referral_source || null,
      notes: notes || null,
      status: "lead",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ client });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { id, name, email, phone, instagram, event_type, event_date, location, partner_name, budget, referral_source, notes } = body;

  if (!id) return NextResponse.json({ error: "Client id required" }, { status: 400 });

  const updates: Record<string, any> = {};
  const fields = ["name","email","phone","instagram","event_type","event_date","location","partner_name","budget","referral_source","notes"];
  for (const f of fields) {
    if (body[f] !== undefined) updates[f] = body[f] === "" ? null : body[f];
  }
  updates.updated_at = new Date().toISOString();

  const { data: client, error } = await supabase
    .from("clients")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userData.user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ client });
}

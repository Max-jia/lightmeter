import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: events } = await supabase
    .from("clients")
    .select("id, name, event_type, event_date, location")
    .eq("user_id", userData.user.id)
    .not("event_date", "is", null)
    .neq("status", "completed")
    .neq("status", "archived")
    .order("event_date", { ascending: true })
    .limit(100);

  return NextResponse.json({ events: events || [] });
}

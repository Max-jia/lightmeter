import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_account_id")
    .eq("id", userData.user.id)
    .single();

  if (!profile?.stripe_account_id) {
    return NextResponse.json({ connected: false });
  }

  try {
    const account = await stripe().accounts.retrieve(profile.stripe_account_id);
    return NextResponse.json({
      connected: true,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
    });
  } catch {
    return NextResponse.json({ connected: false });
  }
}

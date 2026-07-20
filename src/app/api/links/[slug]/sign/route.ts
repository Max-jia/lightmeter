import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * POST /api/links/[slug]/sign
 * 客户端签署合同（公开 API，无需登录）
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { name } = await request.json();

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: link } = await supabase
    .from("links")
    .select("id, status")
    .eq("slug", slug)
    .single();

  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  if (link.status === "signed" || link.status === "paid") {
    return NextResponse.json({ error: "Already signed" }, { status: 400 });
  }

  const { error } = await supabase
    .from("links")
    .update({
      status: "signed",
      contract_signed_by: name,
      contract_signed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", link.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

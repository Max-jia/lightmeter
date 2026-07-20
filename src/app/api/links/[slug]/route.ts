import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * GET /api/links/[slug]
 * 公开 API — 客户端通过 slug 访问链接，无需登录
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const supabase = await createClient();

  const { data: link } = await supabase
    .from("links")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  // 更新浏览次数
  await supabase
    .from("links")
    .update({ view_count: (link.view_count || 0) + 1 })
    .eq("id", link.id);

  return NextResponse.json({ link });
}

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase 服务端客户端（带 cookie 读写）
 *
 * if needResponseCookies = true，返回 { supabase, responseCookies }
 * 用于 auth 路由：把 responseCookies 写入你的 redirect Response
 *
 * if needResponseCookies = false（默认），返回 supabase 客户端
 * 用于数据查询：只需要读 cookie
 */
export async function createClient(needResponseCookies?: boolean): Promise<any> {
  const cookieStore = await cookies();
  const responseCookies: Array<{ name: string; value: string; options: any }> = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          responseCookies.push(...cookiesToSet);
        },
      },
    }
  );

  if (needResponseCookies) {
    return { supabase, responseCookies };
  }

  return supabase;
}

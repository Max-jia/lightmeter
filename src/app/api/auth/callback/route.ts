import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

  if (!code) {
    return NextResponse.redirect(new URL(`/login?error=no_code`, baseUrl), 303);
  }

  const supabaseResponse = NextResponse.redirect(new URL("/dashboard", baseUrl), 303);
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => {
          const cookiePairs = request.headers.get("cookie")?.split("; ") || [];
          return cookiePairs.map((pair) => {
            const [name, ...rest] = pair.split("=");
            return { name, value: rest.join("=") };
          });
        },
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  try {
    await supabase.auth.exchangeCodeForSession(code);
  } catch (err: any) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(err.message)}`, baseUrl), 303);
  }

  return supabaseResponse;
}

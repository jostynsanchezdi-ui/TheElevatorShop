import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PATHS = ["/account"];

// Allow-list of origins permitted to call our mutating API routes.
// GET requests are not validated (read-only, no CSRF risk for state changes).
const ALLOWED_ORIGINS = new Set([
  "https://theelevatorshop.net",
  "https://www.theelevatorshop.net",
  "https://theelevatorshop.netlify.app",
  "http://localhost:3000",
  "http://localhost:3001",
]);

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── CORS / CSRF check for mutating API routes ───────────────────────────
  if (pathname.startsWith("/api/") && MUTATING_METHODS.has(request.method)) {
    const origin = request.headers.get("origin");
    // Browsers always send Origin for cross-origin requests and POST same-origin.
    // If absent, the call is likely server-to-server / curl / a webhook — reject for now;
    // we'll whitelist specific webhook endpoints (e.g. /api/stripe/webhook) when those exist.
    if (!origin || !ALLOWED_ORIGINS.has(origin)) {
      return new NextResponse(
        JSON.stringify({ error: "Origin not allowed" }),
        { status: 403, headers: { "content-type": "application/json" } }
      );
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("placeholder")) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

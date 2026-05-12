import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TokenCache {
  access_token: string;
  expires_at: number;
}

// In-memory fallback — valid within a single warm container
let memCache: TokenCache | null = null;

async function readCache(): Promise<TokenCache | null> {
  if (memCache && Date.now() < memCache.expires_at - 60_000) return memCache;

  const { data } = await admin
    .from("zoho_token_cache")
    .select("access_token, expires_at")
    .eq("key", "zoho")
    .single();

  if (data && data.access_token && Date.now() < data.expires_at - 60_000) {
    memCache = { access_token: data.access_token, expires_at: data.expires_at };
    return memCache;
  }
  return null;
}

async function writeCache(token: string, expiresIn: number) {
  const expires_at = Date.now() + expiresIn * 1000;
  memCache = { access_token: token, expires_at };

  await admin.from("zoho_token_cache").upsert(
    { key: "zoho", access_token: token, expires_at },
    { onConflict: "key" }
  );
}

let refreshPromise: Promise<string> | null = null;

async function doRefresh(): Promise<string> {
  const accountsUrl = process.env.ZOHO_ACCOUNTS_URL ?? "https://accounts.zoho.com";
  const body = new URLSearchParams({
    refresh_token: process.env.ZOHO_REFRESH_TOKEN!,
    client_id: process.env.ZOHO_CLIENT_ID!,
    client_secret: process.env.ZOHO_CLIENT_SECRET!,
    grant_type: "refresh_token",
  });

  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 2000 * attempt));
    const res = await fetch(`${accountsUrl}/oauth/v2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = await res.json();
    if (data.access_token) {
      await writeCache(data.access_token, data.expires_in ?? 3600);
      return data.access_token as string;
    }
    if (data.error !== "too_many_requests") break;
  }
  throw new Error("Zoho token refresh failed after retries");
}

export async function getZohoAccessToken(): Promise<string> {
  const cached = await readCache();
  if (cached) return cached.access_token;

  if (refreshPromise) return refreshPromise;

  refreshPromise = doRefresh().finally(() => { refreshPromise = null; });
  return refreshPromise;
}

import fs from "fs";
import path from "path";

const TOKEN_FILE = process.env.NETLIFY
  ? path.join("/tmp", "zoho-token.json")
  : path.join(process.cwd(), ".next", "zoho-token.json");

interface TokenCache {
  access_token: string;
  expires_at: number;
}

// In-memory cache — survives multiple invocations within the same warm container
let memCache: TokenCache | null = null;

function readCache(): TokenCache | null {
  if (memCache && Date.now() < memCache.expires_at - 60_000) return memCache;
  try {
    const raw = fs.readFileSync(TOKEN_FILE, "utf8");
    const parsed = JSON.parse(raw) as TokenCache;
    if (Date.now() < parsed.expires_at - 60_000) {
      memCache = parsed;
      return parsed;
    }
  } catch {}
  return null;
}

function writeCache(token: string, expiresIn: number) {
  const entry: TokenCache = { access_token: token, expires_at: Date.now() + expiresIn * 1000 };
  memCache = entry;
  try {
    fs.mkdirSync(path.dirname(TOKEN_FILE), { recursive: true });
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(entry));
  } catch {}
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

  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 1000 * attempt));
    const res = await fetch(`${accountsUrl}/oauth/v2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = await res.json();
    if (data.access_token) {
      writeCache(data.access_token, data.expires_in ?? 3600);
      return data.access_token as string;
    }
    // If Zoho says "too many requests", wait and retry
    if (data.error !== "too_many_requests" && attempt === 0) break;
  }
  throw new Error("Zoho token refresh failed after retries");
}

export async function getZohoAccessToken(): Promise<string> {
  const cached = readCache();
  if (cached) return cached.access_token;

  if (refreshPromise) return refreshPromise;

  refreshPromise = doRefresh().finally(() => { refreshPromise = null; });
  return refreshPromise;
}

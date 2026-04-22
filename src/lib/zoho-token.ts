import fs from "fs";
import path from "path";

const TOKEN_FILE = process.env.NETLIFY
  ? path.join("/tmp", "zoho-token.json")
  : path.join(process.cwd(), ".next", "zoho-token.json");

interface TokenCache {
  access_token: string;
  expires_at: number;
}

function readDiskCache(): TokenCache | null {
  try {
    const raw = fs.readFileSync(TOKEN_FILE, "utf8");
    return JSON.parse(raw) as TokenCache;
  } catch {
    return null;
  }
}

function writeDiskCache(token: string, expiresIn: number) {
  try {
    fs.mkdirSync(path.dirname(TOKEN_FILE), { recursive: true });
    fs.writeFileSync(TOKEN_FILE, JSON.stringify({ access_token: token, expires_at: Date.now() + expiresIn * 1000 }));
  } catch {}
}

let refreshPromise: Promise<string> | null = null;

export async function getZohoAccessToken(): Promise<string> {
  // Check in-memory first (fastest)
  const disk = readDiskCache();
  if (disk && Date.now() < disk.expires_at - 60_000) return disk.access_token;

  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const accountsUrl = process.env.ZOHO_ACCOUNTS_URL ?? "https://accounts.zoho.com";
    const res = await fetch(`${accountsUrl}/oauth/v2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        refresh_token: process.env.ZOHO_REFRESH_TOKEN!,
        client_id: process.env.ZOHO_CLIENT_ID!,
        client_secret: process.env.ZOHO_CLIENT_SECRET!,
        grant_type: "refresh_token",
      }),
    });
    const data = await res.json();
    if (!data.access_token) throw new Error(`Token refresh failed: ${JSON.stringify(data)}`);
    writeDiskCache(data.access_token, data.expires_in ?? 3600);
    return data.access_token as string;
  })().finally(() => { refreshPromise = null; });

  return refreshPromise;
}

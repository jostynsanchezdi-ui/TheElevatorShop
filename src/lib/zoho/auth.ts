import type { ZohoTokenResponse } from "./types";

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

export async function getZohoAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: process.env.ZOHO_CLIENT_ID!,
    client_secret: process.env.ZOHO_CLIENT_SECRET!,
    refresh_token: process.env.ZOHO_REFRESH_TOKEN!,
  });

  const res = await fetch(
    `https://accounts.zoho.com/oauth/v2/token?${params}`,
    { method: "POST" }
  );

  if (!res.ok) throw new Error("Failed to refresh Zoho token");

  const data: ZohoTokenResponse = await res.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

  return cachedToken;
}

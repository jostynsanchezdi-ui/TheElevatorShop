import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.json({ error: error ?? "No code returned" }, { status: 400 });
  }

  const clientId = process.env.ZOHO_CLIENT_ID!;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET!;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const redirectUri = `${appUrl}/api/zoho/callback`;
  const accountsUrl = process.env.ZOHO_ACCOUNTS_URL ?? "https://accounts.zoho.com";

  const res = await fetch(`${accountsUrl}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const data = await res.json();

  if (!data.refresh_token) {
    return NextResponse.json({ error: "No refresh_token in response", data }, { status: 400 });
  }

  // Show the refresh token so you can copy it into .env.local
  return NextResponse.json({
    message: "✅ Copy this refresh_token into ZOHO_REFRESH_TOKEN in .env.local",
    refresh_token: data.refresh_token,
    access_token: data.access_token,
    expires_in: data.expires_in,
  });
}

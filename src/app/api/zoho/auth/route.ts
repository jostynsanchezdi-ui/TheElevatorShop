import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.ZOHO_CLIENT_ID!;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const redirectUri = `${appUrl}/api/zoho/callback`;
  const accountsUrl = process.env.ZOHO_ACCOUNTS_URL ?? "https://accounts.zoho.com";

  const params = new URLSearchParams({
    scope: "ZohoInventory.FullAccess.all",
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    access_type: "offline",
  });

  return NextResponse.redirect(`${accountsUrl}/oauth/v2/auth?${params}`);
}

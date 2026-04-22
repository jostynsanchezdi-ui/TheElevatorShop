import { NextRequest, NextResponse } from "next/server";
import { getZohoAccessToken } from "@/lib/zoho-token";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const token = await getZohoAccessToken();
    const base = process.env.ZOHO_API_BASE_URL!;
    const orgId = process.env.ZOHO_ORGANIZATION_ID!;

    const res = await fetch(
      `${base}/items/${itemId}/image?organization_id=${orgId}`,
      { headers: { Authorization: `Zoho-oauthtoken ${token}` } }
    );

    if (!res.ok) {
      const body = await res.text();
      console.error(`Zoho image ${itemId} → ${res.status}: ${body}`);
      return new NextResponse(null, { status: 404 });
    }

    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": res.headers.get("content-type") ?? "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}

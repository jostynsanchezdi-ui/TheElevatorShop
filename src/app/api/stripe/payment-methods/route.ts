import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  const customerId = req.nextUrl.searchParams.get("customerId");
  if (!customerId) return NextResponse.json({ methods: [] });

  const { data } = await stripe.paymentMethods.list({ customer: customerId, type: "card" });
  return NextResponse.json({ methods: data });
}

export async function DELETE(req: NextRequest) {
  const { paymentMethodId } = await req.json();
  if (!paymentMethodId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await stripe.paymentMethods.detach(paymentMethodId);
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { email, name, stripeCustomerId } = await req.json();

    let customerId: string = stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({ email, name });
      customerId = customer.id;
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
    });

    return NextResponse.json({ clientSecret: setupIntent.client_secret, customerId });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { renderPurchaseOrderEmail } from "@/emails/purchase-order-email";
import { renderInternalAlertEmail } from "@/emails/internal-alert-email";

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://theelevatorshop.net";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await admin
    .from("user_orders")
    .insert(body)
    .select("id, po_number, created_at")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Insert failed" }, { status: 500 });
  }

  // Send emails in background — don't block the response
  const addr = body.shipping_address ?? {};
  const billing = addr.billing ?? {};
  const customerEmail = billing.email ?? addr.email ?? null;
  const customerName = billing.full_name ?? addr.full_name ?? "Customer";
  const downloadUrl = `${APP_URL}/po/${data.id}?print=1`;

  if (customerEmail) {
    const clientHtml = renderPurchaseOrderEmail({
      customerName,
      poNumber: data.po_number,
      orderDate: data.created_at,
      items: body.items ?? [],
      subtotal: body.subtotal,
      shippingCost: body.shipping_cost,
      total: body.total,
      shippingAddress: {
        fullName: addr.full_name,
        company: addr.company ?? null,
        line1: addr.line1,
        line2: addr.line2 ?? null,
        city: addr.city,
        state: addr.state,
        zip: addr.zip,
      },
      billingAddress: {
        fullName: billing.full_name ?? addr.full_name,
        company: billing.company ?? null,
        email: customerEmail,
        phone: billing.phone ?? null,
        line1: billing.line1 ?? null,
        line2: billing.line2 ?? null,
        city: billing.city ?? null,
        state: billing.state ?? null,
        zip: billing.zip ?? null,
      },
      downloadUrl,
    });

    const internalHtml = renderInternalAlertEmail({
      poNumber: data.po_number,
      orderDate: data.created_at,
      customerName,
      customerEmail,
      items: body.items ?? [],
      subtotal: body.subtotal,
      shippingCost: body.shipping_cost,
      total: body.total,
      shippingCity: addr.city,
      shippingState: addr.state,
      orderId: data.id,
    });

    const po = `PO-${String(data.po_number).padStart(5, "0")}`;

    await Promise.all([
      resend.emails.send({
        from: "orders@theelevatorshop.net",
        to: customerEmail,
        subject: `Order Confirmation · ${po}`,
        html: clientHtml,
      }),
      resend.emails.send({
        from: "orders@theelevatorshop.net",
        to: "sales@theelevatorshop.net",
        subject: `New Order ${po} — ${customerName} — $${(body.total / 100).toFixed(2)}`,
        html: internalHtml,
      }),
    ]).catch(console.error);
  }

  return NextResponse.json({ id: data.id });
}

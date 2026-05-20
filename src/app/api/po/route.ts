import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { renderPurchaseOrderEmail } from "@/emails/purchase-order-email";
import { renderInternalAlertEmail } from "@/emails/internal-alert-email";
import { calcTaxCents } from "@/lib/tax";
import { pushOrderToZoho } from "@/lib/zoho-sales-order";

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://theelevatorshop.net";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // tax isn't a column in user_orders — strip it before insert and recompute for emails
  const { tax: _ignoredTax, ...insertBody } = body;
  void _ignoredTax;
  const tax = calcTaxCents(body.subtotal ?? 0);

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await admin
    .from("user_orders")
    .insert(insertBody)
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
  const viewUrl = `${APP_URL}/po/${data.id}`;
  const downloadUrl = `${APP_URL}/po/${data.id}?print=1`;
  const po = `PO-${String(data.po_number).padStart(5, "0")}`;

  if (customerEmail) {
    const clientHtml = renderPurchaseOrderEmail({
      customerName,
      poNumber: data.po_number,
      orderDate: data.created_at,
      items: body.items ?? [],
      subtotal: body.subtotal,
      tax,
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
      viewUrl,
      downloadUrl,
    });

    const internalHtml = renderInternalAlertEmail({
      poNumber: data.po_number,
      orderDate: data.created_at,
      customerName,
      customerEmail,
      items: body.items ?? [],
      subtotal: body.subtotal,
      tax,
      shippingCost: body.shipping_cost,
      total: body.total,
      shippingCity: addr.city,
      shippingState: addr.state,
      orderId: data.id,
    });

    await Promise.all([
      resend.emails.send({
        from: "sales@theelevatorshop.net",
        to: customerEmail,
        subject: `Order Confirmation · ${po}`,
        html: clientHtml,
      }),
      resend.emails.send({
        from: "sales@theelevatorshop.net",
        to: "sales@theelevatorshop.net",
        subject: `New Order ${po} — ${customerName} — $${(body.total / 100).toFixed(2)}`,
        html: internalHtml,
      }),
    ]).catch(console.error);
  }

  // Push to Zoho as a Sales Order (non-blocking — never fails the PO if Zoho is down)
  if (customerEmail) {
    const billingZohoAddr = {
      attention: billing.full_name ?? customerName,
      address: billing.line1 ?? addr.line1,
      street2: billing.line2 ?? addr.line2 ?? undefined,
      city: billing.city ?? addr.city,
      state: billing.state ?? addr.state,
      zip: billing.zip ?? addr.zip,
      country: "U.S.A",
      phone: billing.phone ?? addr.phone ?? undefined,
    };
    const shippingZohoAddr = {
      attention: addr.full_name,
      address: addr.line1,
      street2: addr.line2 ?? undefined,
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      country: "U.S.A",
      phone: addr.phone ?? undefined,
    };

    pushOrderToZoho({
      customerName,
      customerEmail,
      customerPhone: billing.phone ?? addr.phone ?? null,
      company: billing.company ?? addr.company ?? null,
      referenceNumber: po,
      items: (body.items ?? []).map((it: { id: string; name: string; price: number; quantity: number }) => ({
        id: it.id,
        name: it.name,
        price: it.price,
        quantity: it.quantity,
      })),
      shippingCostCents: body.shipping_cost ?? 0,
      shippingAddress: shippingZohoAddr,
      billingAddress: billingZohoAddr,
    })
      .then((res) => {
        if (res.ok) {
          console.log(`[zoho] SO created for ${po}: ${res.salesorder_number} (id=${res.salesorder_id})`);
        } else {
          console.error(`[zoho] SO creation FAILED for ${po}:`, res.error);
        }
      })
      .catch((err) => console.error(`[zoho] unexpected error for ${po}:`, err));
  }

  return NextResponse.json({ id: data.id });
}

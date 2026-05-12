interface OrderItem {
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

interface InternalAlertData {
  poNumber: number;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingState: string;
  shippingCity: string;
  orderId: string;
}

function fmt(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(cents / 100);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function renderInternalAlertEmail(d: InternalAlertData): string {
  const po = `#PO-${String(d.poNumber).padStart(5, "0")}`;

  const itemRows = d.items.map((item, i) => `
    <tr style="background:${i % 2 === 0 ? "#ffffff" : "#f9fafb"}; border-bottom:1px solid #f3f4f6;">
      <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#1a2535;">${item.name}<br/><span style="font-size:11px;color:#9ca3af;font-weight:400;">SKU: ${item.sku}</span></td>
      <td style="padding:10px 14px;text-align:center;font-size:13px;font-weight:700;color:#E87B3A;">${item.quantity}</td>
      <td style="padding:10px 14px;text-align:right;font-size:13px;color:#374151;">${fmt(item.price)}</td>
      <td style="padding:10px 14px;text-align:right;font-size:13px;font-weight:700;color:#1a2535;">${fmt(item.price * item.quantity)}</td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>New Order ${po}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- TOP BAR -->
        <tr>
          <td style="background:#2C3A48;border-radius:12px 12px 0 0;">
            <div style="height:6px;background:#E87B3A;border-radius:12px 12px 0 0;"></div>
            <div style="padding:20px 32px;">
              <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.14em;color:rgba(255,255,255,0.5);text-transform:uppercase;">New Purchase Order</p>
              <p style="margin:4px 0 0;font-size:22px;font-weight:900;color:#ffffff;font-family:ui-monospace,monospace;">${po}</p>
              <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.6);">${fmtDate(d.orderDate)} · ${d.customerName}</p>
            </div>
          </td>
        </tr>

        <!-- CUSTOMER + TOTAL -->
        <tr>
          <td style="background:#ffffff;padding:24px 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="60%">
                  <p style="margin:0 0 2px;font-size:10px;font-weight:700;letter-spacing:0.1em;color:#9ca3af;text-transform:uppercase;">Customer</p>
                  <p style="margin:0;font-size:15px;font-weight:700;color:#1a2535;">${d.customerName}</p>
                  <p style="margin:2px 0 0;font-size:12px;color:#E87B3A;">${d.customerEmail}</p>
                  <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">Ships to: ${d.shippingCity}, ${d.shippingState}</p>
                </td>
                <td width="40%" style="text-align:right;">
                  <p style="margin:0 0 2px;font-size:10px;font-weight:700;letter-spacing:0.1em;color:#9ca3af;text-transform:uppercase;">Order Total</p>
                  <p style="margin:0;font-size:26px;font-weight:900;color:#E87B3A;">${fmt(d.total)}</p>
                  <p style="margin:2px 0 0;font-size:12px;color:#9ca3af;">${d.items.length} item${d.items.length !== 1 ? "s" : ""} · incl. shipping</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ITEMS TABLE -->
        <tr>
          <td style="background:#ffffff;padding:0 32px 24px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
            <p style="margin:0 0 12px;font-size:13px;font-weight:800;color:#1a2535;text-transform:uppercase;letter-spacing:0.06em;">Order Items</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;border-collapse:collapse;">
              <thead>
                <tr style="background:#2C3A48;">
                  <th style="padding:9px 14px;text-align:left;font-size:10px;font-weight:700;color:#fff;letter-spacing:0.1em;">ITEM</th>
                  <th style="padding:9px 14px;text-align:center;font-size:10px;font-weight:700;color:#fff;letter-spacing:0.1em;width:50px;">QTY</th>
                  <th style="padding:9px 14px;text-align:right;font-size:10px;font-weight:700;color:#fff;letter-spacing:0.1em;width:90px;">UNIT</th>
                  <th style="padding:9px 14px;text-align:right;font-size:10px;font-weight:700;color:#fff;letter-spacing:0.1em;width:90px;">TOTAL</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
              <tr>
                <td style="text-align:right;padding:3px 0;font-size:12px;color:#6b7280;">Subtotal <span style="color:#1a2535;font-weight:600;margin-left:32px;">${fmt(d.subtotal)}</span></td>
              </tr>
              <tr>
                <td style="text-align:right;padding:3px 0;font-size:12px;color:#6b7280;">Shipping <span style="color:#1a2535;font-weight:600;margin-left:32px;">${fmt(d.shippingCost)}</span></td>
              </tr>
              <tr>
                <td style="text-align:right;padding:8px 0 0;border-top:1px solid #e5e7eb;font-size:15px;font-weight:800;color:#1a2535;">Total <span style="margin-left:32px;">${fmt(d.total)}</span></td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#2C3A48;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;">
            <p style="margin:0;font-size:14px;font-weight:900;color:#ffffff;">The<span style="color:#E87B3A;">Elevator</span>Shop — Internal</p>
            <p style="margin:4px 0 0;font-size:10px;color:rgba(255,255,255,0.4);">© ${new Date().getFullYear()} TheElevatorShop. All Rights Reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

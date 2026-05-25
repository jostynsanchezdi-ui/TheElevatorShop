import { getUnit } from "@/lib/product-units";

interface OrderItem {
  name: string;
  sku?: string;
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
  tax: number;
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
  const orderUrl = `https://theelevatorshop.net/po/${d.orderId}`;

  const itemRows = d.items.map((item) => `
    <tr style="border-bottom:1px solid #f1f3f5;">
      <td style="padding:14px 4px;font-size:13px;font-weight:700;color:#1a2535;line-height:1.4;">${item.name}</td>
      <td style="padding:14px 4px;text-align:center;font-size:13px;font-weight:700;color:#E87B3A;">${item.quantity} <span style="font-size:10px;color:#9ca3af;font-weight:500;">${getUnit(item.name)}</span></td>
      <td style="padding:14px 4px;text-align:right;font-size:13px;color:#374151;">${fmt(item.price)}</td>
      <td style="padding:14px 4px;text-align:right;font-size:13px;font-weight:700;color:#1a2535;">${fmt(item.price * item.quantity)}</td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Order ${po}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 12px;">
    <tr><td align="center">
      <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">

        <!-- TOP NAVY BAR -->
        <tr>
          <td style="background:#2C3A48;padding:0;line-height:0;">
            <div style="height:56px;background:#2C3A48;border-bottom:4px solid #E87B3A;"></div>
          </td>
        </tr>

        <!-- HERO: New Order Banner -->
        <tr>
          <td style="background:#ffffff;padding:32px 32px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;">
              <tr>
                <td style="padding:28px 24px 24px;text-align:center;">
                  <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:0.18em;color:#9ca3af;text-transform:uppercase;">New Purchase Order</p>
                  <p style="margin:0;font-size:30px;font-weight:900;color:#1a2535;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:0.02em;">${po}</p>
                  <p style="margin:10px 0 0;font-size:13px;color:#6b7280;">${fmtDate(d.orderDate)} &middot; ${d.customerName}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- SUMMARY CARD: Customer + Total -->
        <tr>
          <td style="background:#ffffff;padding:0 32px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:14px;">
              <tr>
                <td style="padding:22px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="60%" style="vertical-align:top;">
                        <p style="margin:0 0 5px;font-size:10px;font-weight:700;letter-spacing:0.12em;color:#9ca3af;text-transform:uppercase;">Customer</p>
                        <p style="margin:0;font-size:15px;font-weight:700;color:#1a2535;">${d.customerName}</p>
                        <p style="margin:3px 0 0;font-size:12px;"><a href="mailto:${d.customerEmail}" style="color:#E87B3A;text-decoration:none;font-weight:600;">${d.customerEmail}</a></p>
                        <p style="margin:8px 0 0;font-size:12px;color:#6b7280;">Ships to: ${d.shippingCity}, ${d.shippingState}</p>
                      </td>
                      <td width="40%" style="vertical-align:top;text-align:right;">
                        <p style="margin:0 0 5px;font-size:10px;font-weight:700;letter-spacing:0.12em;color:#9ca3af;text-transform:uppercase;">Order Total</p>
                        <p style="margin:0;font-size:26px;font-weight:600;color:#E87B3A;line-height:1;">${fmt(d.total)}</p>
                        <p style="margin:6px 0 0;font-size:11px;color:#9ca3af;">${d.items.length} item${d.items.length !== 1 ? "s" : ""} &middot; incl. shipping</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- VIEW BUTTON -->
        <tr>
          <td style="background:#ffffff;padding:8px 32px 28px;">
            <a href="${orderUrl}" style="display:block;padding:14px 16px;background:#1a2535;border:1.5px solid #1a2535;border-radius:10px;font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;text-align:center;">View Purchase Order</a>
          </td>
        </tr>

        <!-- ORDER ITEMS -->
        <tr>
          <td style="background:#ffffff;padding:0 32px 28px;">
            <p style="margin:0 0 8px;font-size:15px;font-weight:800;color:#1a2535;">Order Items</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <thead>
                <tr style="border-bottom:1px solid #e5e7eb;">
                  <th style="padding:10px 4px;text-align:left;font-size:10px;font-weight:700;color:#9ca3af;letter-spacing:0.12em;text-transform:uppercase;">Item</th>
                  <th style="padding:10px 4px;text-align:center;font-size:10px;font-weight:700;color:#9ca3af;letter-spacing:0.12em;text-transform:uppercase;width:60px;">Qty</th>
                  <th style="padding:10px 4px;text-align:right;font-size:10px;font-weight:700;color:#9ca3af;letter-spacing:0.12em;text-transform:uppercase;width:90px;">Unit Price</th>
                  <th style="padding:10px 4px;text-align:right;font-size:10px;font-weight:700;color:#9ca3af;letter-spacing:0.12em;text-transform:uppercase;width:90px;">Subtotal</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">
              <tr>
                <td style="padding:5px 4px;text-align:right;font-size:13px;color:#6b7280;">Subtotal</td>
                <td width="110" style="padding:5px 4px;text-align:right;font-size:13px;font-weight:600;color:#1a2535;">${fmt(d.subtotal)}</td>
              </tr>
              <tr>
                <td style="padding:5px 4px;text-align:right;font-size:13px;color:#6b7280;">NY Sales Tax <span style="color:#9ca3af;">(8.875%)</span></td>
                <td width="110" style="padding:5px 4px;text-align:right;font-size:13px;font-weight:600;color:#1a2535;">${fmt(d.tax)}</td>
              </tr>
              <tr>
                <td style="padding:5px 4px;text-align:right;font-size:13px;color:#6b7280;">Shipping <span style="color:#9ca3af;">(${d.shippingCity}, ${d.shippingState})</span></td>
                <td width="110" style="padding:5px 4px;text-align:right;font-size:13px;font-weight:600;color:#1a2535;">${fmt(d.shippingCost)}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding:10px 4px 0;"><div style="height:1px;background:#e5e7eb;"></div></td>
              </tr>
              <tr>
                <td style="padding:14px 4px 0;text-align:right;font-size:16px;font-weight:600;color:#1a2535;">Total</td>
                <td width="110" style="padding:14px 4px 0;text-align:right;font-size:16px;font-weight:600;color:#1a2535;">${fmt(d.total)}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#2C3A48;padding:24px 32px;text-align:center;">
            <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#ffffff;">The<span style="color:#E87B3A;">Elevator</span>Shop <span style="color:rgba(255,255,255,0.5);font-weight:400;">&middot; Internal</span></p>
            <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.4);">© ${new Date().getFullYear()} TheElevatorShop. All Rights Reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

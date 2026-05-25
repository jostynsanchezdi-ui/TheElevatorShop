import { getUnit } from "@/lib/product-units";

interface OrderItem {
  name: string;
  sku?: string;
  quantity: number;
  price: number;
}

interface EmailData {
  customerName: string;
  poNumber: number;
  orderDate: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  shippingAddress: {
    fullName: string;
    company?: string | null;
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    zip: string;
  };
  billingAddress: {
    fullName: string;
    company?: string | null;
    email: string;
    phone?: string | null;
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
  };
  viewUrl: string;
  downloadUrl: string;
}

function fmt(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(cents / 100);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function fmtPO(n: number) {
  return `#PO-${String(n).padStart(5, "0")}`;
}

export function renderPurchaseOrderEmail(d: EmailData): string {
  const po = fmtPO(d.poNumber);

  const itemRows = d.items.map((item) => `
    <tr style="border-bottom:1px solid #f1f3f5;">
      <td style="padding:16px 4px;font-size:13px;font-weight:700;color:#1a2535;line-height:1.4;">${item.name}</td>
      <td style="padding:16px 4px;text-align:center;font-size:13px;color:#374151;">${item.quantity} <span style="font-size:10px;color:#9ca3af;">${getUnit(item.name)}</span></td>
      <td style="padding:16px 4px;text-align:right;font-size:13px;color:#374151;">${fmt(item.price)}</td>
      <td style="padding:16px 4px;text-align:right;font-size:13px;font-weight:700;color:#1a2535;">${fmt(item.price * item.quantity)}</td>
    </tr>
  `).join("");

  const ship = d.shippingAddress;
  const bill = d.billingAddress;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmation ${po}</title>
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

        <!-- HERO -->
        <tr>
          <td style="background:#ffffff;padding:36px 32px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;">
              <tr>
                <td style="padding:36px 24px 32px;text-align:center;">
                  <div style="width:60px;height:60px;border-radius:50%;background:#E87B3A;margin:0 auto 18px;text-align:center;line-height:60px;">
                    <span style="color:#ffffff;font-size:28px;font-weight:900;line-height:60px;">&#10003;</span>
                  </div>
                  <h1 style="margin:0 0 12px;font-size:24px;font-weight:900;color:#1a2535;line-height:1.2;">Thank you for your order!</h1>
                  <p style="margin:0 auto;font-size:13px;color:#6b7280;line-height:1.65;max-width:380px;">We've received your purchase order and our team is preparing your shipment. You'll receive payment instructions shortly.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- PO SUMMARY CARD -->
        <tr>
          <td style="background:#ffffff;padding:0 32px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:14px;">
              <tr>
                <td style="padding:22px 24px 18px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-size:10px;font-weight:700;letter-spacing:0.16em;color:#9ca3af;text-transform:uppercase;">Purchase Order</td>
                      <td style="text-align:right;font-size:20px;font-weight:900;color:#1a2535;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:0.02em;">${po}</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr><td style="padding:0 24px;"><div style="height:1px;background:#e5e7eb;"></div></td></tr>
              <tr>
                <td style="padding:20px 24px 22px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="50%" align="center" style="padding-bottom:18px;text-align:center;">
                        <p style="margin:0 0 5px;font-size:10px;font-weight:700;letter-spacing:0.12em;color:#9ca3af;text-transform:uppercase;">Order Date</p>
                        <p style="margin:0;font-size:14px;font-weight:600;color:#1a2535;">${fmtDate(d.orderDate)}</p>
                      </td>
                      <td width="50%" align="center" style="padding-bottom:18px;text-align:center;">
                        <p style="margin:0 0 5px;font-size:10px;font-weight:700;letter-spacing:0.12em;color:#9ca3af;text-transform:uppercase;">Status</p>
                        <span style="display:inline-block;padding:4px 12px;border-radius:999px;background:#fef3c7;font-size:10px;font-weight:800;color:#b45309;letter-spacing:0.08em;">&#9679; PENDING</span>
                      </td>
                    </tr>
                    <tr>
                      <td width="50%" align="center" style="text-align:center;">
                        <p style="margin:0 0 5px;font-size:10px;font-weight:700;letter-spacing:0.12em;color:#9ca3af;text-transform:uppercase;">Items</p>
                        <p style="margin:0;font-size:14px;font-weight:600;color:#1a2535;">${d.items.length} item${d.items.length !== 1 ? "s" : ""}</p>
                      </td>
                      <td width="50%" align="center" style="text-align:center;">
                        <p style="margin:0 0 5px;font-size:10px;font-weight:700;letter-spacing:0.12em;color:#9ca3af;text-transform:uppercase;">Total</p>
                        <p style="margin:0;font-size:14px;font-weight:600;color:#1a2535;">${fmt(d.total)}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- BUTTONS -->
        <tr>
          <td style="background:#ffffff;padding:8px 32px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="50%" style="padding-right:6px;">
                  <a href="${d.viewUrl}" style="display:block;padding:14px 16px;background:#1a2535;border:1.5px solid #1a2535;border-radius:10px;font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;text-align:center;">View Purchase Order</a>
                </td>
                <td width="50%" style="padding-left:6px;">
                  <a href="${d.downloadUrl}" style="display:block;padding:14px 16px;background:#ffffff;border:1.5px solid #1a2535;border-radius:10px;font-size:13px;font-weight:700;color:#1a2535;text-decoration:none;text-align:center;">Download PDF</a>
                </td>
              </tr>
            </table>
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
                <td style="padding:5px 4px;text-align:right;font-size:13px;color:#6b7280;">Shipping <span style="color:#9ca3af;">(${ship.city}, ${ship.state})</span></td>
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

        <!-- ADDRESSES -->
        <tr>
          <td style="background:#ffffff;padding:0 32px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="48%" style="vertical-align:top;border:1px solid #e5e7eb;border-radius:12px;padding:18px 20px;">
                  <p style="margin:0 0 10px;font-size:10px;font-weight:700;letter-spacing:0.14em;color:#9ca3af;text-transform:uppercase;">Ship To</p>
                  <p style="margin:0 0 3px;font-size:13px;font-weight:700;color:#1a2535;">${ship.fullName}</p>
                  ${ship.company ? `<p style="margin:0 0 3px;font-size:12px;color:#374151;">c/o ${ship.company}</p>` : ""}
                  <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.7;">${ship.line1}${ship.line2 ? `, ${ship.line2}` : ""}<br />${ship.city}, ${ship.state} ${ship.zip}</p>
                </td>
                <td width="4%">&nbsp;</td>
                <td width="48%" style="vertical-align:top;border:1px solid #e5e7eb;border-radius:12px;padding:18px 20px;">
                  <p style="margin:0 0 10px;font-size:10px;font-weight:700;letter-spacing:0.14em;color:#9ca3af;text-transform:uppercase;">Bill To</p>
                  <p style="margin:0 0 3px;font-size:13px;font-weight:700;color:#1a2535;">${bill.fullName}</p>
                  ${bill.company ? `<p style="margin:0 0 3px;font-size:12px;color:#374151;">${bill.company}</p>` : ""}
                  ${bill.line1 ? `<p style="margin:0 0 3px;font-size:12px;color:#6b7280;line-height:1.7;">${bill.line1}${bill.line2 ? `, ${bill.line2}` : ""}<br />${bill.city}, ${bill.state} ${bill.zip}</p>` : ""}
                  ${bill.email ? `<p style="margin:4px 0 0;font-size:12px;color:#6b7280;">${bill.email}</p>` : ""}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- WHAT HAPPENS NEXT -->
        <tr>
          <td style="background:#ffffff;padding:0 32px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff3eb;border-radius:14px;">
              <tr>
                <td style="padding:24px 24px 22px;">
                  <p style="margin:0 0 16px;font-size:15px;font-weight:800;color:#1a2535;">What happens next?</p>
                  <table cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="vertical-align:top;padding:0 12px 12px 0;width:24px;">
                        <span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:#E87B3A;font-size:11px;font-weight:800;color:#fff;text-align:center;line-height:22px;">1</span>
                      </td>
                      <td style="font-size:13px;color:#374151;padding-bottom:12px;line-height:1.55;">Our team will review your order and prepare a secure payment link.</td>
                    </tr>
                    <tr>
                      <td style="vertical-align:top;padding:0 12px 12px 0;width:24px;">
                        <span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:#E87B3A;font-size:11px;font-weight:800;color:#fff;text-align:center;line-height:22px;">2</span>
                      </td>
                      <td style="font-size:13px;color:#374151;padding-bottom:12px;line-height:1.55;">You'll receive a separate email with payment instructions within <strong>1 business day</strong>.</td>
                    </tr>
                    <tr>
                      <td style="vertical-align:top;padding:0 12px 0 0;width:24px;">
                        <span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:#E87B3A;font-size:11px;font-weight:800;color:#fff;text-align:center;line-height:22px;">3</span>
                      </td>
                      <td style="font-size:13px;color:#374151;line-height:1.55;">Once payment is confirmed, we ship from our Long Island City, NY warehouse.</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- QUESTIONS -->
        <tr>
          <td style="background:#ffffff;padding:0 32px 36px;text-align:center;">
            <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#1a2535;">Questions about your order?</p>
            <a href="mailto:sales@theelevatorshop.net" style="font-size:13px;color:#E87B3A;font-weight:700;text-decoration:none;">sales@theelevatorshop.net</a>
            <p style="margin:8px 0 0;font-size:12px;color:#9ca3af;">Please reference your PO number in any correspondence.</p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#2C3A48;padding:28px 32px;text-align:center;">
            <p style="margin:0 0 6px;font-size:17px;font-weight:600;color:#ffffff;">The<span style="color:#E87B3A;">Elevator</span>Shop</p>
            <p style="margin:0 0 16px;font-size:11px;color:rgba(255,255,255,0.5);">Long Island City, NY 11101</p>
            <p style="margin:0 0 14px;font-size:11px;">
              <a href="https://theelevatorshop.net/about" style="color:rgba(255,255,255,0.7);text-decoration:none;margin:0 8px;">About</a>
              <span style="color:rgba(255,255,255,0.3);">·</span>
              <a href="https://theelevatorshop.net/contact" style="color:rgba(255,255,255,0.7);text-decoration:none;margin:0 8px;">Contact</a>
              <span style="color:rgba(255,255,255,0.3);">·</span>
              <a href="https://theelevatorshop.net/shop" style="color:rgba(255,255,255,0.7);text-decoration:none;margin:0 8px;">Shop</a>
            </p>
            <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.4);">© ${new Date().getFullYear()} TheElevatorShop. All Rights Reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

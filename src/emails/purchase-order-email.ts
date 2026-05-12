interface OrderItem {
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

interface EmailData {
  customerName: string;
  poNumber: number;
  orderDate: string;
  items: OrderItem[];
  subtotal: number;
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

  const itemRows = d.items.map((item, i) => `
    <tr style="background:${i % 2 === 0 ? "#ffffff" : "#f9fafb"}; border-bottom:1px solid #f3f4f6;">
      <td style="padding:12px 16px;">
        <p style="margin:0;font-size:13px;font-weight:700;color:#1a2535;">${item.name}</p>
        <p style="margin:2px 0 0;font-size:11px;color:#9ca3af;">SKU: ${item.sku}</p>
      </td>
      <td style="padding:12px 16px;text-align:center;font-size:13px;color:#E87B3A;font-weight:700;">${item.quantity}</td>
      <td style="padding:12px 16px;text-align:right;font-size:13px;color:#374151;">${fmt(item.price)}</td>
      <td style="padding:12px 16px;text-align:right;font-size:13px;font-weight:700;color:#1a2535;">${fmt(item.price * item.quantity)}</td>
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
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- TOP BAR -->
        <tr>
          <td style="background:#2C3A48;border-radius:12px 12px 0 0;padding:0;">
            <div style="height:6px;background:#E87B3A;border-radius:12px 12px 0 0;"></div>
            <div style="height:40px;"></div>
          </td>
        </tr>

        <!-- LOGO + TAGLINE -->
        <tr>
          <td style="background:#ffffff;padding:32px 48px 24px;text-align:center;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
            <img src="https://theelevatorshop.net/logo-transparent.png" alt="TheElevatorShop" width="140" style="display:inline-block;height:auto;" />
            <p style="margin:8px 0 0;font-size:10px;font-weight:700;letter-spacing:0.18em;color:#9ca3af;text-transform:uppercase;">Premium Elevator Parts &amp; Equipment</p>
          </td>
        </tr>

        <!-- HERO -->
        <tr>
          <td style="background:#ffffff;padding:0 48px 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:32px 24px;text-align:center;">
                  <!-- Checkmark circle -->
                  <div style="width:56px;height:56px;border-radius:50%;background:#E87B3A;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
                    <img src="https://theelevatorshop.net/checkmark-white.png" alt="✓" width="24" style="display:inline-block;" />
                    <!--[if !mso]><!-->
                    <span style="color:#ffffff;font-size:24px;font-weight:900;line-height:1;">✓</span>
                    <!--<![endif]-->
                  </div>
                  <h1 style="margin:0 0 10px;font-size:22px;font-weight:900;color:#1a2535;">Thank you for your order!</h1>
                  <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;max-width:340px;margin:0 auto;">We've received your purchase order and our team is preparing your shipment. You'll receive payment instructions shortly.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- PO SUMMARY CARD -->
        <tr>
          <td style="background:#ffffff;padding:0 48px 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
              <!-- PO header row -->
              <tr>
                <td style="padding:18px 20px 14px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-size:10px;font-weight:700;letter-spacing:0.14em;color:#9ca3af;text-transform:uppercase;">Purchase Order</td>
                      <td style="text-align:right;font-size:20px;font-weight:900;color:#1a2535;font-family:ui-monospace,monospace;">${po}</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr><td style="padding:0 20px;"><div style="height:1px;background:#e5e7eb;"></div></td></tr>
              <!-- Grid: date / status / items / total -->
              <tr>
                <td style="padding:16px 20px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="50%" style="padding-bottom:12px;">
                        <p style="margin:0 0 3px;font-size:10px;font-weight:700;letter-spacing:0.1em;color:#9ca3af;text-transform:uppercase;">Order Date</p>
                        <p style="margin:0;font-size:14px;font-weight:700;color:#1a2535;">${fmtDate(d.orderDate)}</p>
                      </td>
                      <td width="50%" style="padding-bottom:12px;">
                        <p style="margin:0 0 3px;font-size:10px;font-weight:700;letter-spacing:0.1em;color:#9ca3af;text-transform:uppercase;">Status</p>
                        <span style="display:inline-block;padding:3px 10px;border-radius:20px;background:#d1fae5;border:1px solid #6ee7b7;font-size:10px;font-weight:700;color:#059669;letter-spacing:0.08em;">● CONFIRMED</span>
                      </td>
                    </tr>
                    <tr>
                      <td width="50%">
                        <p style="margin:0 0 3px;font-size:10px;font-weight:700;letter-spacing:0.1em;color:#9ca3af;text-transform:uppercase;">Items</p>
                        <p style="margin:0;font-size:14px;font-weight:700;color:#1a2535;">${d.items.length} item${d.items.length !== 1 ? "s" : ""}</p>
                      </td>
                      <td width="50%">
                        <p style="margin:0 0 3px;font-size:10px;font-weight:700;letter-spacing:0.1em;color:#9ca3af;text-transform:uppercase;">Total</p>
                        <p style="margin:0;font-size:14px;font-weight:700;color:#1a2535;">${fmt(d.total)}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Download button only -->
              <tr>
                <td style="padding:0 20px 20px;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <a href="${d.downloadUrl}" style="display:inline-block;padding:12px 28px;background:#ffffff;border:1.5px solid #2C3A48;border-radius:8px;font-size:13px;font-weight:700;color:#2C3A48;text-decoration:none;">Download PDF</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ORDER ITEMS -->
        <tr>
          <td style="background:#ffffff;padding:0 48px 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
            <p style="margin:0 0 14px;font-size:15px;font-weight:800;color:#1a2535;">Order Items</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;border-collapse:collapse;">
              <thead>
                <tr style="background:#2C3A48;">
                  <th style="padding:10px 16px;text-align:left;font-size:10px;font-weight:700;color:#ffffff;letter-spacing:0.1em;">ITEM</th>
                  <th style="padding:10px 16px;text-align:center;font-size:10px;font-weight:700;color:#ffffff;letter-spacing:0.1em;width:60px;">QTY</th>
                  <th style="padding:10px 16px;text-align:right;font-size:10px;font-weight:700;color:#ffffff;letter-spacing:0.1em;width:100px;">UNIT PRICE</th>
                  <th style="padding:10px 16px;text-align:right;font-size:10px;font-weight:700;color:#ffffff;letter-spacing:0.1em;width:100px;">SUBTOTAL</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
            </table>
            <!-- Totals -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
              <tr>
                <td style="text-align:right;padding:4px 0;">
                  <span style="font-size:13px;color:#6b7280;">Subtotal</span>
                  <span style="font-size:13px;font-weight:600;color:#1a2535;margin-left:40px;">${fmt(d.subtotal)}</span>
                </td>
              </tr>
              <tr>
                <td style="text-align:right;padding:4px 0;">
                  <span style="font-size:13px;color:#6b7280;">Shipping (${ship.city}, ${ship.state})</span>
                  <span style="font-size:13px;font-weight:600;color:#1a2535;margin-left:40px;">${fmt(d.shippingCost)}</span>
                </td>
              </tr>
              <tr>
                <td style="text-align:right;padding:10px 0 0;border-top:1px solid #e5e7eb;margin-top:8px;">
                  <span style="font-size:15px;font-weight:800;color:#1a2535;">Total</span>
                  <span style="font-size:15px;font-weight:800;color:#1a2535;margin-left:40px;">${fmt(d.total)}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ADDRESSES -->
        <tr>
          <td style="background:#ffffff;padding:0 48px 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <!-- SHIP TO -->
                <td width="48%" style="vertical-align:top;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:18px 20px;">
                  <p style="margin:0 0 10px;font-size:10px;font-weight:800;letter-spacing:0.14em;color:#E87B3A;text-transform:uppercase;border-bottom:2px solid #E87B3A;padding-bottom:6px;display:inline-block;">Ship To</p>
                  <p style="margin:8px 0 2px;font-size:13px;font-weight:700;color:#1a2535;">${ship.fullName}</p>
                  ${ship.company ? `<p style="margin:0 0 2px;font-size:12px;color:#374151;">c/o ${ship.company}</p>` : ""}
                  <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.7;">${ship.line1}${ship.line2 ? `, ${ship.line2}` : ""}<br />${ship.city}, ${ship.state} ${ship.zip}</p>
                </td>
                <td width="4%"></td>
                <!-- BILL TO -->
                <td width="48%" style="vertical-align:top;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:18px 20px;">
                  <p style="margin:0 0 10px;font-size:10px;font-weight:800;letter-spacing:0.14em;color:#E87B3A;text-transform:uppercase;border-bottom:2px solid #E87B3A;padding-bottom:6px;display:inline-block;">Bill To</p>
                  <p style="margin:8px 0 2px;font-size:13px;font-weight:700;color:#1a2535;">${bill.fullName}</p>
                  ${bill.company ? `<p style="margin:0 0 2px;font-size:12px;color:#374151;">${bill.company}</p>` : ""}
                  ${bill.line1 ? `<p style="margin:0 0 2px;font-size:12px;color:#6b7280;line-height:1.7;">${bill.line1}${bill.line2 ? `, ${bill.line2}` : ""}<br />${bill.city}, ${bill.state} ${bill.zip}</p>` : ""}
                  ${bill.email ? `<p style="margin:4px 0 0;font-size:11px;color:#9ca3af;">${bill.email}</p>` : ""}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- WHAT HAPPENS NEXT -->
        <tr>
          <td style="background:#ffffff;padding:0 48px 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7f2;border:1px solid #fed7aa;border-radius:12px;padding:24px;">
              <tr>
                <td style="padding:24px;">
                  <div style="width:32px;height:32px;border-radius:50%;background:#E87B3A;display:inline-flex;align-items:center;justify-content:center;margin-bottom:14px;">
                    <span style="color:#ffffff;font-size:16px;font-weight:900;">→</span>
                  </div>
                  <p style="margin:0 0 14px;font-size:15px;font-weight:800;color:#1a2535;">What happens next?</p>
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="vertical-align:top;padding-right:10px;padding-bottom:10px;">
                        <span style="display:inline-block;width:20px;height:20px;border-radius:50%;background:#E87B3A;font-size:10px;font-weight:800;color:#fff;text-align:center;line-height:20px;">1</span>
                      </td>
                      <td style="font-size:13px;color:#374151;padding-bottom:10px;">Our team will review your order and prepare a secure payment link.</td>
                    </tr>
                    <tr>
                      <td style="vertical-align:top;padding-right:10px;padding-bottom:10px;">
                        <span style="display:inline-block;width:20px;height:20px;border-radius:50%;background:#E87B3A;font-size:10px;font-weight:800;color:#fff;text-align:center;line-height:20px;">2</span>
                      </td>
                      <td style="font-size:13px;color:#374151;padding-bottom:10px;">You'll receive a separate email with payment instructions within <strong>1 business day</strong>.</td>
                    </tr>
                    <tr>
                      <td style="vertical-align:top;padding-right:10px;">
                        <span style="display:inline-block;width:20px;height:20px;border-radius:50%;background:#E87B3A;font-size:10px;font-weight:800;color:#fff;text-align:center;line-height:20px;">3</span>
                      </td>
                      <td style="font-size:13px;color:#374151;">Once payment is confirmed, we ship from our Long Island City, NY warehouse.</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- QUESTIONS -->
        <tr>
          <td style="background:#ffffff;padding:0 48px 40px;text-align:center;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;border-radius:0 0 0 0;">
            <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#1a2535;">Questions about your order?</p>
            <a href="mailto:sales@theelevatorshop.net" style="font-size:13px;color:#E87B3A;font-weight:600;text-decoration:none;">sales@theelevatorshop.net</a>
            <p style="margin:8px 0 0;font-size:12px;color:#9ca3af;">Please reference your PO number in any correspondence.</p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#2C3A48;border-radius:0 0 12px 12px;padding:28px 48px;text-align:center;">
            <p style="margin:0 0 4px;font-size:16px;font-weight:900;color:#ffffff;">The<span style="color:#E87B3A;">Elevator</span>Shop</p>
            <p style="margin:0 0 14px;font-size:11px;color:rgba(255,255,255,0.5);">Long Island City, NY 11101</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding-bottom:14px;">
                  <a href="https://theelevatorshop.net/about" style="font-size:11px;color:rgba(255,255,255,0.6);text-decoration:none;margin:0 10px;">About</a>
                  <span style="color:rgba(255,255,255,0.3);">·</span>
                  <a href="https://theelevatorshop.net/contact" style="font-size:11px;color:rgba(255,255,255,0.6);text-decoration:none;margin:0 10px;">Contact</a>
                  <span style="color:rgba(255,255,255,0.3);">·</span>
                  <a href="https://theelevatorshop.net/returns" style="font-size:11px;color:rgba(255,255,255,0.6);text-decoration:none;margin:0 10px;">Returns</a>
                </td>
              </tr>
            </table>
            <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.35);">© ${new Date().getFullYear()} TheElevatorShop. All Rights Reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

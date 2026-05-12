interface ContactCustomerData {
  customerName: string;
  subject: string;
}

export function renderContactCustomerEmail(d: ContactCustomerData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>We received your message</title>
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
          <td style="background:#ffffff;padding:36px 32px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;">
              <tr>
                <td style="padding:40px 24px 36px;text-align:center;">
                  <h1 style="margin:0 0 14px;font-size:24px;font-weight:800;color:#1a2535;line-height:1.2;">Thanks for reaching out, ${d.customerName}!</h1>
                  <p style="margin:0 auto;font-size:13px;color:#6b7280;line-height:1.65;max-width:420px;">We've received your support request and one of our team members will get back to you within <strong style="color:#1a2535;">24 hours</strong>.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- TICKET SUMMARY -->
        <tr>
          <td style="background:#ffffff;padding:0 32px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:14px;">
              <tr>
                <td style="padding:22px 24px;">
                  <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:0.14em;color:#9ca3af;text-transform:uppercase;">Your Request</p>
                  <p style="margin:0;font-size:14px;font-weight:600;color:#1a2535;line-height:1.5;">${d.subject || "Support Request"}</p>
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
                <td style="padding:22px 24px;">
                  <p style="margin:0 0 14px;font-size:15px;font-weight:800;color:#1a2535;">What happens next?</p>
                  <table cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="vertical-align:top;padding:0 12px 10px 0;width:24px;">
                        <span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:#E87B3A;font-size:11px;font-weight:800;color:#fff;text-align:center;line-height:22px;">1</span>
                      </td>
                      <td style="font-size:13px;color:#374151;padding-bottom:10px;line-height:1.55;">Our team reviews your request and prepares a tailored response.</td>
                    </tr>
                    <tr>
                      <td style="vertical-align:top;padding:0 12px 10px 0;width:24px;">
                        <span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:#E87B3A;font-size:11px;font-weight:800;color:#fff;text-align:center;line-height:22px;">2</span>
                      </td>
                      <td style="font-size:13px;color:#374151;padding-bottom:10px;line-height:1.55;">A specialist will reach out within <strong>1 business day</strong>.</td>
                    </tr>
                    <tr>
                      <td style="vertical-align:top;padding:0 12px 0 0;width:24px;">
                        <span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:#E87B3A;font-size:11px;font-weight:800;color:#fff;text-align:center;line-height:22px;">3</span>
                      </td>
                      <td style="font-size:13px;color:#374151;line-height:1.55;">If urgent, you can also reach us directly at sales@theelevatorshop.net.</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#2C3A48;padding:28px 32px;text-align:center;">
            <p style="margin:0 0 6px;font-size:17px;font-weight:600;color:#ffffff;">The<span style="color:#E87B3A;">Elevator</span>Shop</p>
            <p style="margin:0 0 16px;font-size:11px;color:rgba(255,255,255,0.5);">Long Island City, NY 11101</p>
            <p style="margin:0 0 14px;font-size:11px;">
              <a href="https://theelevatorshop.net/about" style="color:rgba(255,255,255,0.7);text-decoration:none;margin:0 8px;">About</a>
              <span style="color:rgba(255,255,255,0.3);">&middot;</span>
              <a href="https://theelevatorshop.net/contact" style="color:rgba(255,255,255,0.7);text-decoration:none;margin:0 8px;">Contact</a>
              <span style="color:rgba(255,255,255,0.3);">&middot;</span>
              <a href="https://theelevatorshop.net/shop" style="color:rgba(255,255,255,0.7);text-decoration:none;margin:0 8px;">Shop</a>
            </p>
            <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.4);">&copy; ${new Date().getFullYear()} TheElevatorShop. All Rights Reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

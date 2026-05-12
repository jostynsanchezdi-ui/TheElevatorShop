interface LeadTeamData {
  customerEmail: string;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export function renderLeadTeamEmail(d: LeadTeamData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Parts Inquiry</title>
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
          <td style="background:#ffffff;padding:32px 32px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;">
              <tr>
                <td style="padding:32px 24px 28px;text-align:center;">
                  <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:0.18em;color:#9ca3af;text-transform:uppercase;">New Parts Inquiry</p>
                  <p style="margin:0;font-size:22px;font-weight:600;color:#1a2535;line-height:1.3;">A customer is requesting support</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CUSTOMER CARD -->
        <tr>
          <td style="background:#ffffff;padding:0 32px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:14px;">
              <tr>
                <td style="padding:24px;text-align:center;">
                  <p style="margin:0 0 8px;font-size:10px;font-weight:700;letter-spacing:0.14em;color:#9ca3af;text-transform:uppercase;">Customer Email</p>
                  <p style="margin:0;font-size:18px;"><a href="mailto:${d.customerEmail}" style="color:#E87B3A;text-decoration:none;font-weight:600;">${escapeHtml(d.customerEmail)}</a></p>
                  <p style="margin:14px 0 0;font-size:12px;color:#6b7280;line-height:1.6;">Source: <strong>"Ready to Get New Parts"</strong> form on the homepage</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- REPLY BUTTON -->
        <tr>
          <td style="background:#ffffff;padding:8px 32px 32px;">
            <a href="mailto:${d.customerEmail}?subject=Your%20elevator%20parts%20inquiry" style="display:block;padding:14px 16px;background:#1a2535;border:1.5px solid #1a2535;border-radius:10px;font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;text-align:center;">Reach out to customer</a>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#2C3A48;padding:24px 32px;text-align:center;">
            <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#ffffff;">The<span style="color:#E87B3A;">Elevator</span>Shop <span style="color:rgba(255,255,255,0.5);font-weight:400;">&middot; Internal</span></p>
            <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.4);">&copy; ${new Date().getFullYear()} TheElevatorShop. All Rights Reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

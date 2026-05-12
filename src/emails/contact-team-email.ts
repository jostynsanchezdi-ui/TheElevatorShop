interface ContactTeamData {
  customerName: string;
  customerEmail: string;
  subject: string;
  message: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/\n/g, "<br />");
}

export function renderContactTeamEmail(d: ContactTeamData): string {
  const subj = d.subject?.trim() || "Support Request";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Support Ticket</title>
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
                <td style="padding:28px 24px 24px;text-align:center;">
                  <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:0.18em;color:#9ca3af;text-transform:uppercase;">New Support Ticket</p>
                  <p style="margin:0;font-size:22px;font-weight:600;color:#1a2535;line-height:1.3;">${escapeHtml(subj)}</p>
                  <p style="margin:10px 0 0;font-size:13px;color:#6b7280;">From ${escapeHtml(d.customerName)}</p>
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
                <td style="padding:22px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="vertical-align:top;">
                        <p style="margin:0 0 5px;font-size:10px;font-weight:700;letter-spacing:0.12em;color:#9ca3af;text-transform:uppercase;">Customer</p>
                        <p style="margin:0;font-size:15px;font-weight:600;color:#1a2535;">${escapeHtml(d.customerName)}</p>
                        <p style="margin:4px 0 0;font-size:13px;"><a href="mailto:${d.customerEmail}" style="color:#E87B3A;text-decoration:none;font-weight:600;">${escapeHtml(d.customerEmail)}</a></p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- MESSAGE -->
        <tr>
          <td style="background:#ffffff;padding:0 32px 20px;">
            <p style="margin:0 0 8px;font-size:15px;font-weight:800;color:#1a2535;">Message</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:14px;">
              <tr>
                <td style="padding:20px 22px;font-size:13px;color:#374151;line-height:1.7;white-space:pre-wrap;">${escapeHtml(d.message)}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- REPLY BUTTON -->
        <tr>
          <td style="background:#ffffff;padding:8px 32px 32px;">
            <a href="mailto:${d.customerEmail}?subject=Re:%20${encodeURIComponent(subj)}" style="display:block;padding:14px 16px;background:#1a2535;border:1.5px solid #1a2535;border-radius:10px;font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;text-align:center;">Reply to ${escapeHtml(d.customerName)}</a>
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

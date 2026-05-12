import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { renderLeadCustomerEmail } from "@/emails/lead-customer-email";
import { renderLeadTeamEmail } from "@/emails/lead-team-email";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const customerHtml = renderLeadCustomerEmail();
    const teamHtml = renderLeadTeamEmail({ customerEmail: email });

    await Promise.all([
      resend.emails.send({
        from: "noreply@theelevatorshop.net",
        to: email,
        replyTo: "sales@theelevatorshop.net",
        subject: `We received your request · TheElevatorShop`,
        html: customerHtml,
      }),
      resend.emails.send({
        from: "noreply@theelevatorshop.net",
        to: "sales@theelevatorshop.net",
        replyTo: email,
        subject: `New parts inquiry from ${email}`,
        html: teamHtml,
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("lead route error", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}

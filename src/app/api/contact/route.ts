import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { renderContactCustomerEmail } from "@/emails/contact-customer-email";
import { renderContactTeamEmail } from "@/emails/contact-team-email";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const cleanSubject = (subject || "Support Request").toString().trim().slice(0, 200);
    const customerHtml = renderContactCustomerEmail({ customerName: name, subject: cleanSubject });
    const teamHtml = renderContactTeamEmail({
      customerName: name,
      customerEmail: email,
      subject: cleanSubject,
      message,
    });

    await Promise.all([
      resend.emails.send({
        from: "noreply@theelevatorshop.net",
        to: email,
        replyTo: "sales@theelevatorshop.net",
        subject: `We received your message · TheElevatorShop`,
        html: customerHtml,
      }),
      resend.emails.send({
        from: "noreply@theelevatorshop.net",
        to: "sales@theelevatorshop.net",
        replyTo: email,
        subject: `New ticket: ${cleanSubject} — ${name}`,
        html: teamHtml,
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("contact route error", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}

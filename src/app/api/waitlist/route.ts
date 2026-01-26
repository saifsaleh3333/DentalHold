import { Resend } from "resend";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, practiceName, message } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check for API key
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send email notification
    const { error } = await resend.emails.send({
      from: "DentalHold Waitlist <onboarding@resend.dev>",
      to: "saifsaleh1028@gmail.com",
      subject: "New DentalHold Waitlist Signup",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Waitlist Signup</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Someone just joined the DentalHold waitlist!</p>
          </div>

          <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                  <strong style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Name</strong>
                  <div style="color: #1e293b; font-size: 16px; margin-top: 4px;">${name || "Not provided"}</div>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                  <strong style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Email</strong>
                  <div style="color: #1e293b; font-size: 16px; margin-top: 4px;">
                    <a href="mailto:${email}" style="color: #0ea5e9; text-decoration: none;">${email}</a>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                  <strong style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Practice Name</strong>
                  <div style="color: #1e293b; font-size: 16px; margin-top: 4px;">${practiceName || "Not provided"}</div>
                </td>
              </tr>
              ${message ? `<tr>
                <td style="padding: 12px 0;">
                  <strong style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Message</strong>
                  <div style="color: #1e293b; font-size: 16px; margin-top: 4px; white-space: pre-wrap;">${message}</div>
                </td>
              </tr>` : ""}
            </table>

            <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0;">
                Submitted on ${new Date().toLocaleString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  timeZoneName: "short",
                })}
              </p>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Waitlist API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

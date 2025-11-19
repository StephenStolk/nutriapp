import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import SibApiV3Sdk from "@getbrevo/brevo";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    const supabase = createClient();

    // 1️⃣ Generate email verification link
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "email_verification",
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify`,
      },
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    const verifyLink = data.properties.action_link;

    // 2️⃣ Send email using Brevo API
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    apiInstance.setApiKey(
      SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY!
    );

    await apiInstance.sendTransacEmail({
      sender: { name: "Kalnut", email: "yourgmail@gmail.com" }, // your sender email
      to: [{ email }],
      subject: "Verify your Kalnut Email",
      htmlContent: `
        <h2>Email Verification</h2>
        <p>Click below to verify your email:</p>
        <a href="${verifyLink}" target="_blank">Verify Email</a>
      `,
    });

    return Response.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return Response.json({ error: "Failed to send email" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import crypto from "crypto";

const getSupabase = () => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    throw new Error("Missing Supabase credentials");
  }
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
};

const getResend = () => {
  if (!process.env.AUTH_RESEND_KEY) {
    throw new Error("Missing Resend API key");
  }
  return new Resend(process.env.AUTH_RESEND_KEY);
};

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Only allow @plasma.to emails
    if (!normalizedEmail.endsWith("@plasma.to")) {
      return NextResponse.json(
        { error: "Only @plasma.to emails can access this app" },
        { status: 403 }
      );
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store token in Supabase
    const supabase = getSupabase();
    
    // Delete any existing tokens for this email
    await supabase.from("magic_tokens").delete().eq("email", normalizedEmail);

    // Insert new token
    const { error: insertError } = await supabase.from("magic_tokens").insert({
      email: normalizedEmail,
      token,
      expires_at: expiresAt.toISOString(),
    });

    if (insertError) {
      console.error("Failed to store token:", insertError);
      return NextResponse.json(
        { error: "Failed to generate magic link" },
        { status: 500 }
      );
    }

    // Build magic link URL
    const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;
    const magicLink = `${baseUrl}/api/auth/verify?email=${encodeURIComponent(normalizedEmail)}&token=${token}`;

    // Send email via Resend
    const resend = getResend();
    const { error: emailError } = await resend.emails.send({
      from: "Plasma Figurines <onboarding@resend.dev>",
      to: normalizedEmail,
      subject: "Sign in to Plasma Figurine Generator",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #162F29; padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Plasma Figurine Generator</h1>
          </div>
          <div style="padding: 30px; background-color: #f8faf9; border-radius: 0 0 12px 12px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Click the button below to sign in to the Plasma Figurine Generator:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${magicLink}" 
                 style="background-color: #162F29; color: white; padding: 14px 28px; 
                        text-decoration: none; border-radius: 8px; font-weight: bold;
                        display: inline-block;">
                Sign In
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              This link will expire in 15 minutes.
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              If you didn't request this email, you can safely ignore it.
            </p>
          </div>
        </div>
      `,
    });

    if (emailError) {
      console.error("Failed to send email:", emailError);
      return NextResponse.json(
        { error: "Failed to send magic link email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Magic link error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

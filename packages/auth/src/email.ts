import { Resend } from "resend";

export type OTPType = "sign-in" | "email-verification" | "forget-password";

export type SendOTPEmailParams = {
  email: string;
  otp: string;
  type: OTPType;
  apiKey: string;
  fromEmail: string;
};

/**
 * Get email subject based on OTP type
 */
function getEmailSubject(type: OTPType): string {
  switch (type) {
    case "sign-in":
      return "Your Spotfinder Sign-In Code";
    case "email-verification":
      return "Verify Your Spotfinder Email";
    case "forget-password":
      return "Your Spotfinder Password Reset Code";
    default:
      return "Your Spotfinder Verification Code";
  }
}

/**
 * Get email body content based on OTP type
 */
function getEmailBody(type: OTPType, otp: string): string {
  const otpDisplay = `<div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px; background-color: #f3f4f6; border-radius: 8px; margin: 20px 0; font-family: monospace;">${otp}</div>`;

  let purpose = "";
  let action = "";
  switch (type) {
    case "sign-in":
      purpose = "sign in to your account";
      action = "Use this code to complete your sign-in";
      break;
    case "email-verification":
      purpose = "verify your email address";
      action = "Use this code to verify your email address";
      break;
    case "forget-password":
      purpose = "reset your password";
      action = "Use this code to reset your password";
      break;
    default:
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #1f2937; margin-top: 0;">Spotfinder Verification Code</h1>

          <p style="font-size: 16px; color: #4b5563;">
            Hello,
          </p>

          <p style="font-size: 16px; color: #4b5563;">
            You requested a verification code to ${purpose}. ${action}:
          </p>

          ${otpDisplay}

          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            <strong>This code will expire in 5 minutes.</strong>
          </p>

          <p style="font-size: 14px; color: #6b7280;">
            If you didn't request this code, you can safely ignore this email. Someone may have entered your email address by mistake.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

          <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
            © ${new Date().getFullYear()} Spotfinder. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send OTP email using Resend
 * In Cloudflare Workers, we need to await this to ensure the email is sent
 * before the worker terminates.
 */
export async function sendOTPEmail({
  email,
  otp,
  type,
  apiKey,
  fromEmail,
}: SendOTPEmailParams): Promise<void> {
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is required to send emails");
  }

  const resend = new Resend(apiKey);

  const subject = getEmailSubject(type);
  const html = getEmailBody(type, otp);

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject,
      html,
    });
    console.log("Email sent successfully:", result);
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    // Re-throw to let the caller handle it
    throw error;
  }
}

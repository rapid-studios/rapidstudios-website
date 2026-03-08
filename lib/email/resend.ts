import { Resend } from "resend";

let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (resendInstance) return resendInstance;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set.");
  }

  resendInstance = new Resend(apiKey);
  return resendInstance;
}

export type ContactInquiry = {
  name: string;
  email: string;
  company: string;
  projectType: string;
  note: string;
};

export type SendResult = {
  success: boolean;
  error?: string;
};

const emailFrom = () => process.env.EMAIL_FROM ?? "Rapid Studios <hello@mail.rapidstudios.dev>";
const emailReplyTo = () => process.env.EMAIL_REPLY_TO ?? "hello@rapidstudios.dev";
const emailNotify = () => process.env.EMAIL_NOTIFY ?? "hello@rapidstudios.dev";

/**
 * Send the customer auto-reply confirmation email.
 */
export async function sendCustomerConfirmation(inquiry: ContactInquiry): Promise<SendResult> {
  try {
    const { InquiryConfirmation } = await import("@/emails/rapid-studios-inquiry");

    const { error } = await getResend().emails.send({
      from: emailFrom(),
      to: inquiry.email,
      replyTo: emailReplyTo(),
      subject: "We received your inquiry -- Rapid Studios",
      react: InquiryConfirmation({ inquiry })
    });

    if (error) {
      console.error("[email] Customer confirmation failed:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[email] Customer confirmation exception:", message);
    return { success: false, error: message };
  }
}

/**
 * Send the internal lead notification email to the team.
 */
export async function sendInternalNotification(inquiry: ContactInquiry): Promise<SendResult> {
  try {
    const { InternalNotification } = await import("@/emails/rapid-studios-internal-notification");

    const { error } = await getResend().emails.send({
      from: emailFrom(),
      to: emailNotify(),
      replyTo: inquiry.email,
      subject: `New inquiry from ${inquiry.name}${inquiry.company ? ` (${inquiry.company})` : ""}`,
      react: InternalNotification({ inquiry })
    });

    if (error) {
      console.error("[email] Internal notification failed:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[email] Internal notification exception:", message);
    return { success: false, error: message };
  }
}

/**
 * Send both emails for a new inquiry. Failures are logged but do not
 * prevent the API from returning success -- the lead data is captured
 * regardless.
 */
export async function sendInquiryEmails(inquiry: ContactInquiry): Promise<{
  customer: SendResult;
  internal: SendResult;
}> {
  const [customer, internal] = await Promise.allSettled([
    sendCustomerConfirmation(inquiry),
    sendInternalNotification(inquiry)
  ]);

  return {
    customer: customer.status === "fulfilled" ? customer.value : { success: false, error: "Promise rejected" },
    internal: internal.status === "fulfilled" ? internal.value : { success: false, error: "Promise rejected" }
  };
}

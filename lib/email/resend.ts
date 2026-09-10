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

const emailFrom = () => (process.env.EMAIL_FROM ?? "Rapid Studios <noreply@mail.rapidstudios.dev>").replace(/^"|"$/g, "");
const emailReplyTo = () => process.env.EMAIL_REPLY_TO ?? "hello@rapidstudios.dev";
const emailNotify = () => process.env.EMAIL_NOTIFY ?? "hello@rapidstudios.dev";

/**
 * Send the customer auto-reply confirmation email.
 */
export async function sendCustomerConfirmation(inquiry: ContactInquiry): Promise<SendResult> {
  try {
    const { InquiryConfirmation } = await import("@/emails/rapid-studios-inquiry");

    const { data, error } = await getResend().emails.send({
      from: emailFrom(),
      to: inquiry.email,
      replyTo: emailReplyTo(),
      subject: "We received your inquiry -- Rapid Studios",
      react: InquiryConfirmation({ inquiry })
    });

    if (error || !data?.id) {
      console.error("[email] Customer confirmation was not accepted.");
      return { success: false, error: "Customer confirmation was not accepted." };
    }

    return { success: true };
  } catch {
    console.error("[email] Customer confirmation request failed.");
    return { success: false, error: "Customer confirmation request failed." };
  }
}

/**
 * Send the internal lead notification email to the team.
 */
export async function sendInternalNotification(inquiry: ContactInquiry): Promise<SendResult> {
  try {
    const { InternalNotification } = await import("@/emails/rapid-studios-internal-notification");

    const { data, error } = await getResend().emails.send({
      from: emailFrom(),
      to: emailNotify(),
      replyTo: inquiry.email,
      subject: `New inquiry from ${inquiry.name}${inquiry.company ? ` (${inquiry.company})` : ""}`,
      react: InternalNotification({ inquiry })
    });

    if (error || !data?.id) {
      console.error("[email] Internal notification was not accepted.");
      return { success: false, error: "Internal notification was not accepted." };
    }

    return { success: true };
  } catch {
    console.error("[email] Internal notification request failed.");
    return { success: false, error: "Internal notification request failed." };
  }
}

/**
 * Get the team notification accepted before acknowledging the inquiry.
 * Email is the only lead destination; a customer receipt alone is not success.
 */
export async function sendInquiryEmails(inquiry: ContactInquiry): Promise<{
  customer: SendResult;
  internal: SendResult;
}> {
  const internal = await sendInternalNotification(inquiry);

  if (!internal.success) {
    return {
      internal,
      customer: { success: false, error: "Skipped because the team notification failed." }
    };
  }

  return {
    internal,
    customer: await sendCustomerConfirmation(inquiry)
  };
}

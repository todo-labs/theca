import { Resend } from "resend";
import { emailTemplates } from "./templates/registry";
import { render } from "@react-email/render";
import React from "react";

const getResend = () => {
  if (!process.env.RESEND_API_KEY) {
    console.warn(
      "RESEND_API_KEY not configured - email functionality disabled",
    );
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
};

export type EmailTemplateKey = keyof typeof emailTemplates;

export const emailService = {
  /**
   * Send an email using a registered template.
   */
  async sendEmail<T extends EmailTemplateKey>(
    to: string,
    templateKey: T,
    props: Parameters<(typeof emailTemplates)[T]["component"]>[0],
    options?: { host?: string },
  ) {
    const templateConfig = emailTemplates[templateKey];
    const { component: Component, getSubject } = templateConfig;

    // @ts-ignore - Component is a valid React component
    const html = await render(React.createElement(Component, props));
    const subject = getSubject(props);

    // Determine the 'from' address
    // 1. Check for EMAIL_FROM env var
    // 2. Otherwise use the provided host to construct a default
    // 3. Fallback to a hardcoded default
    let from = process.env.EMAIL_FROM;

    if (!from && options?.host) {
      from = `Theca <notifications@${options.host}>`;
    }

    if (!from) {
      from = "Theca <notifications@conceptcodes.dev>";
    }

    const resend = getResend();
    if (!resend) {
      console.warn("Email service not available - skipping email send");
      return { success: false, error: "Email service not configured" };
    }

    try {
      const data = await resend.emails.send({
        from,
        to,
        subject,
        html,
      });

      return { success: true, data };
    } catch (error) {
      console.error("Failed to send email:", error);
      return { success: false, error };
    }
  },
};

import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  DOCTOR_INVITE_TEMPLATE,
} from "./emailTemplates.js";

import {
  isMailhog,
  isMailtrap,
  mailtrapClient,
  sender,
  smtpTransport,
} from "./mailClient.js";

const sendEmail = async ({ to, subject, html, category }) => {
  try {
    if (isMailhog) {
      if (!smtpTransport) {
        throw new Error("MailHog transport is not configured");
      }

      await smtpTransport.sendMail({
        from: `"${sender.name}" <${sender.email}>`,
        to,
        subject,
        html,
      });

      console.log(`MailHog: Email sent → ${subject}`);
      return;
    }

    if (isMailtrap) {
      if (!mailtrapClient) {
        throw new Error("Mailtrap client is not configured");
      }

      await mailtrapClient.send({
        from: sender,
        to: [{ email: to }],
        subject,
        html,
        category,
      });

      console.log(`Mailtrap: Email sent → ${subject}`);
      return;
    }

    throw new Error("No mail provider configured");
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Email delivery failed");
  }
};

export const sendVerificationEmail = async (email, verificationToken) => {
  const html = VERIFICATION_EMAIL_TEMPLATE.replace(
    "{verificationCode}",
    verificationToken,
  );

  await sendEmail({
    to: email,
    subject: "Verify your email",
    html,
    category: "Email Verification",
  });
};

export const sendWelcomeEmail = async (email, name) => {
  const html = `
    <h2>Welcome, ${name}!</h2>
    <p>Your account has been verified successfully.</p>
  `;

  await sendEmail({
    to: email,
    subject: "Welcome to Prescripta",
    html,
    category: "Welcome",
  });
};

export const sendResetPasswordEmail = async (email, resetLink) => {
  const html = PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetLink);

  await sendEmail({
    to: email,
    subject: "Reset your password",
    html,
    category: "Password Reset",
  });
};

export const sendResetSuccessEmail = async (email) => {
  await sendEmail({
    to: email,
    subject: "Password reset successful",
    html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    category: "Password Reset",
  });
};

export const sendDoctorInviteEmail = async (email, name, inviteLink) => {
  const html = DOCTOR_INVITE_TEMPLATE.replace("{name}", name).replace(
    "{inviteURL}",
    inviteLink,
  );

  await sendEmail({
    to: email,
    subject: "You have been invited as a doctor",
    html,
    category: "Doctor Invite",
  });
};

import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates.js";
import {
  isMailhog,
  isMailtrap,
  mailtrapClient,
  sender,
  smtpTransport,
} from "./mailClient.js";

const sendWithMailhog = async ({ to, subject, html }) => {
  if (!smtpTransport) {
    throw new Error("MailHog transport is not configured");
  }

  await smtpTransport.sendMail({
    from: `"${sender.name}" <${sender.email}>`,
    to,
    subject,
    html,
  });
};

export const sendVerificationEmail = async (email, verificationToken) => {
  const html = VERIFICATION_EMAIL_TEMPLATE.replace(
    "{verificationCode}",
    verificationToken,
  );

  try {
    if (isMailhog) {
      await sendWithMailhog({
        to: email,
        subject: "Verify your email",
        html,
      });
      return;
    }

    if (isMailtrap) {
      await mailtrapClient.send({
        from: sender,
        to: [{ email }],
        subject: "Verify your email",
        html,
        category: "Email Verification",
      });
    }
  } catch (error) {
    console.error("Error sending verification email", error);
    throw new Error("Failed to send verification email");
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const html = `
    <h2>Welcome, ${name}!</h2>
    <p>Your account has been verified successfully.</p>
  `;

  try {
    if (isMailhog) {
      await sendWithMailhog({
        to: email,
        subject: "Welcome to Prescripta",
        html,
      });
      return;
    }

    if (isMailtrap) {
      await mailtrapClient.send({
        from: sender,
        to: [{ email }],
        template_uuid: "f5b267fb-f318-4cc1-ac87-64baff3de041",
        template_variables: {
          company_info_name: "Test_Company_info_name",
          name,
          company_info_address: "Test_Company_info_address",
          company_info_city: "Test_Company_info_city",
          company_info_zip_code: "Test_Company_info_zip_code",
          company_info_country: "Test_Company_info_country",
        },
      });
    }
  } catch (error) {
    console.error("Error sending welcome email", error);
    throw new Error("Failed to send welcome email");
  }
};

export const sendResetPasswordEmail = async (email, resetLink) => {
  const html = PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetLink);

  try {
    if (isMailhog) {
      await sendWithMailhog({
        to: email,
        subject: "Reset your password",
        html,
      });
      return;
    }

    if (isMailtrap) {
      await mailtrapClient.send({
        from: sender,
        to: [{ email }],
        subject: "Reset your password",
        html,
        category: "Password Reset",
      });
    }
  } catch (error) {
    console.error("Error sending password reset email", error);
    throw new Error("Failed to send password reset email");
  }
};

export const sendResetSuccessEmail = async (email) => {
  try {
    if (isMailhog) {
      await sendWithMailhog({
        to: email,
        subject: "Password reset successful",
        html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      });
      return;
    }

    if (isMailtrap) {
      await mailtrapClient.send({
        from: sender,
        to: [{ email }],
        subject: "Password reset successful",
        html: PASSWORD_RESET_SUCCESS_TEMPLATE,
        category: "Password Reset",
      });
    }
  } catch (error) {
    console.error("Error sending password reset success email", error);
    throw new Error("Failed to send password reset success email");
  }
};
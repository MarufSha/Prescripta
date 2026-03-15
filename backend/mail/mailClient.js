import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { MailtrapClient } from "mailtrap";

dotenv.config();

const provider = process.env.MAIL_PROVIDER || "mailtrap";

export const sender = {
  email:
    provider === "mailhog"
      ? process.env.MAILHOG_FROM_EMAIL || "hello@prescripta.local"
      : "hello@example.com",
  name:
    provider === "mailhog"
      ? process.env.MAILHOG_FROM_NAME || "Prescripta Dev"
      : "Prescripta Team",
};

export const isMailhog = provider === "mailhog";
export const isMailtrap = provider === "mailtrap";

let smtpTransport = null;
let mailtrapClient = null;

if (isMailhog) {
  smtpTransport = nodemailer.createTransport({
    host: process.env.MAILHOG_HOST || "127.0.0.1",
    port: Number(process.env.MAILHOG_PORT || 1025),
    secure: false,
  });
}

if (isMailtrap) {
  const TOKEN = process.env.MAILTRAP_API_KEY;
  const USE_SANDBOX = process.env.MAILTRAP_USE_SANDBOX === "true";
  const INBOX_ID = Number(process.env.MAILTRAP_INBOX_ID);

  if (!TOKEN) throw new Error("MAILTRAP_API_KEY missing");
  if (!USE_SANDBOX)
    throw new Error("MAILTRAP_USE_SANDBOX must be 'true' for Mailtrap Sandbox");
  if (!INBOX_ID) throw new Error("MAILTRAP_INBOX_ID missing/invalid");

  mailtrapClient = new MailtrapClient({
    token: TOKEN,
    sandbox: true,
    testInboxId: INBOX_ID,
  });
}

export { smtpTransport, mailtrapClient };

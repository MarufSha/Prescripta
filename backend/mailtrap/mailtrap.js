import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.MAILTRAP_API_KEY;
const USE_SANDBOX = process.env.MAILTRAP_USE_SANDBOX === "true";
const INBOX_ID = Number(process.env.MAILTRAP_INBOX_ID);

if (!TOKEN) throw new Error("MAILTRAP_API_KEY missing");
if (!USE_SANDBOX) throw new Error("MAILTRAP_USE_SANDBOX must be 'true' for Mailtrap Sandbox");
if (!INBOX_ID) throw new Error("MAILTRAP_INBOX_ID missing/invalid");

export const mailtrapClient = new MailtrapClient({
  token: TOKEN,
  sandbox: true,
  testInboxId: INBOX_ID,
});

export const sender = {
  email: "hello@example.com",
  name: "Prescripta Team",
};
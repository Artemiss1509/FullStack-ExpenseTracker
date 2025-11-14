import nodemailer from "nodemailer";
import { resetPasswordEmail } from "./email.template.js";
import transporter , { accountEmail } from "../utils/nodemailer.js";
import { EMAIL_PASSWORD } from "../utils/env.js";

export const sendResetEmail = async (userEmail, userName, resetLink) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: accountEmail,
        pass: EMAIL_PASSWORD
    },
  });

  const { subject, text, html } = resetPasswordEmail(userName, resetLink);

  const mailOptions = {
    from: `"Expense Tracker" <${accountEmail}>`,
    to: userEmail,
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Reset email sent to ${userEmail}`);
  } catch (error) {
    console.error("❌ Error sending reset email:", error.message);
  }
};

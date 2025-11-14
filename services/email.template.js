export const resetPasswordEmail = (userName, resetLink) => {
    const subject = "Reset your password - Expense Tracker";

    const text = `
Hi ${userName || "there"},

You requested to reset your password for your Expense Tracker account.
Please click the link below to choose a new password:

${resetLink}

If you didn’t request this, you can safely ignore this email.

This link will expire in 15 minutes.

Best regards,
The Expense Tracker Team
`;

    const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset your password</title>
    <style>
      body {
        font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
        background-color: #f4f4f9;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 520px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.06);
        padding: 30px 25px;
      }
      h2 {
        color: #111827;
      }
      p {
        color: #374151;
        line-height: 1.5;
      }
      a.button {
        display: inline-block;
        background-color: #2563eb;
        color: #ffffff !important;
        padding: 12px 24px;
        margin-top: 20px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
      }
      a.button:hover {
        background-color: #1e40af;
      }
      .footer {
        margin-top: 30px;
        font-size: 13px;
        color: #6b7280;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Password Reset Request</h2>
      <p>Hi ${userName || "there"},</p>
      <p>You recently requested to reset your password for your Expense Tracker account.</p>
      <p>Click the button below to reset your password:</p>

      <p style="text-align:center;">
        <a href="${resetLink}" class="button">Reset Password</a>
      </p>

      <p>If the button doesn’t work, copy and paste this link into your browser:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>

      <p>This link will expire in 15 minutes. If you didn’t request a password reset, please ignore this email.</p>

      <div class="footer">
        <p>© ${new Date().getFullYear()} Expense Tracker. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;

    return { subject, text, html };
};

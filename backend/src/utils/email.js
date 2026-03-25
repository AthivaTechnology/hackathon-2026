const nodemailer = require('nodemailer')
const env = require('../config/env')

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
})

const sendPasswordReset = async (toEmail, resetUrl) => {
  await transporter.sendMail({
    from: `"Athiva Hackathon'26" <${env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Reset your password — Athiva Hackathon\'26',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#13131f;color:#fff;border-radius:12px">
        <h2 style="margin:0 0 8px;font-size:20px">Reset your password</h2>
        <p style="color:#9ca3af;margin:0 0 24px;font-size:14px">
          We received a request to reset your password for your Athiva Hackathon'26 account.
          This link expires in <strong style="color:#fff">30 minutes</strong>.
        </p>
        <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#22d3ee);color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px">
          Reset Password
        </a>
        <p style="color:#4b5563;font-size:12px;margin-top:24px">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  })
}

module.exports = { sendPasswordReset }

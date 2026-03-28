const nodemailer = require('nodemailer')
const env = require('../config/env')

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
})

const sendOtpEmail = async (toEmail, code) => {
  await transporter.sendMail({
    from: `"Athiva Hackathon'26" <${env.SMTP_USER}>`,
    to: toEmail,
    subject: "Your login code — Athiva Hackathon'26",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#13131f;color:#fff;border-radius:12px">
        <h2 style="margin:0 0 8px;font-size:20px">Your login code</h2>
        <p style="color:#9ca3af;margin:0 0 24px;font-size:14px">
          Use the code below to sign in to Athiva Hackathon'26.
          It expires in <strong style="color:#fff">10 minutes</strong>.
        </p>
        <div style="background:#1e1e2e;border:1px solid rgba(139,92,246,0.3);border-radius:10px;padding:20px;text-align:center;margin-bottom:24px">
          <span style="font-size:36px;font-weight:800;letter-spacing:12px;background:linear-gradient(135deg,#8b5cf6,#22d3ee);-webkit-background-clip:text;-webkit-text-fill-color:transparent">${code}</span>
        </div>
        <p style="color:#4b5563;font-size:12px;margin:0">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  })
}

module.exports = { sendOtpEmail }

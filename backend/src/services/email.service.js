const nodemailer = require("nodemailer");

let transporter = null;

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

const sendOtpEmail = async (email, otp) => {
  const from =
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    "no-reply@finovo.local";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 420px; margin: 0 auto;">
      <h2 style="color: #172033;">Finovo password reset</h2>
      <p style="color: #475569; font-size: 14px;">
        Use the code below to reset your password. This code expires in 10 minutes.
      </p>
      <div style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #0891b2; text-align: center; padding: 16px 0;">
        ${otp}
      </div>
      <p style="color: #94a3b8; font-size: 12px;">
        If you did not request this, you can safely ignore this email.
      </p>
    </div>
  `;

  await getTransporter().sendMail({
    from,
    to: email,
    subject: "Your Finovo password reset code",
    html,
    text: `Your Finovo password reset code is ${otp}. It expires in 10 minutes.`,
  });
};

module.exports = {
  sendOtpEmail,
};

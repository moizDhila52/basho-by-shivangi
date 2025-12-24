import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER, // Add to .env
    pass: process.env.MAIL_PASS, // Add to .env (App Password)
  },
});

await transporter.verify();

export async function sendOTP(email, otp) {
  await transporter.sendMail({
    from: `"Bashō Ceramics" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Your Login OTP",
    html: `
      <div style="font-family: serif; color: #442D1C; padding: 20px; border: 1px solid #EDD8B4;">
        <h2 style="border-bottom: 2px solid #C85428; padding-bottom: 10px;">Bashō Login</h2>
        <p>Your verification code is:</p>
        <h1 style="color: #C85428; letter-spacing: 4px; font-size: 32px;">${otp}</h1>
        <p style="font-size: 14px; color: #8E5022;">This code expires in 5 minutes.</p>
      </div>
    `,
  });
}